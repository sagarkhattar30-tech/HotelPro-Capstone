const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmationEmail } = require('../utils/emailService');
const {
  findOverlappingBooking,
  calculateHoldExpiresAt,
  withRoomLock
} = require('../utils/bookingAvailability');
const { normalizePaymentMethod, wantsOnlineCard } = require('../utils/paymentMethod');
const { isStripeConfigured, getStripe } = require('../utils/stripeClient');
const { createCheckoutSessionForBooking } = require('../utils/stripeCheckout');
const {
  calculateInrAmount,
  getRazorpayInstance,
  getRazorpayKeyId,
  isRazorpayConfigured
} = require('../utils/razorpayClient');
const { getHeritageSuiteById } = require('../utils/heritageHotelsData');

// Helper to generate unique booking code
const generateBookingNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `HP-2026-${randomDigits}`;
};

// @route   POST /api/bookings
// @desc    Create a new room reservation (Authenticated user only)
router.post('/', protect, async (req, res) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount,
      specialRequests,
      paymentMethod
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Room selection, check-in, and check-out dates are required' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date format' });
    }

    // Check-in date cannot be in the past (before today midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be at least one day after check-in date' });
    }

    // Calculate nights correctly
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Fetch room from database for verified pricing and details
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    let room = await Room.findById(roomId);
    if (!room) {
      room = getHeritageSuiteById(roomId);
    }
    if (!room) {
      return res.status(404).json({ message: 'Selected room not found' });
    }

    // Prevent reservation exceeding room capacity
    const requestedGuests = Number(guestsCount) || 1;
    if (requestedGuests > room.capacity) {
      return res.status(400).json({
        message: `Selected room accommodates a maximum of ${room.capacity} guests (requested ${requestedGuests})`
      });
    }

    // Serialize concurrent reservation operations for this room to prevent race conditions
    return await withRoomLock(room._id, async () => {
      // Check for existing pending/unpaid reservation for the same user, room, and dates to reuse on retry
      const existingUserPendingBooking = await Booking.findOne({
        userEmail: req.user.email.toLowerCase(),
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: { $in: ['Confirmed', 'Checked-In'] },
        paymentStatus: { $in: ['Pending', 'Failed'] }
      });

      const excludeBookingId = existingUserPendingBooking ? existingUserPendingBooking._id : null;
      const overlappingBooking = await findOverlappingBooking(room._id, checkIn, checkOut, excludeBookingId);
      if (overlappingBooking) {
        return res.status(400).json({
          message: `Suite #${room.roomNumber} is already reserved for the selected dates (${overlappingBooking.checkInDate.toISOString().split('T')[0]} to ${overlappingBooking.checkOutDate.toISOString().split('T')[0]}). Please choose different dates.`
        });
      }

      // SERVER-SIDE PRICING CALCULATION (Never trust client-supplied pricePerNight)
      const rate = Number(room.pricePerNight);
      const baseTotal = nights * rate;
      const taxAmount = Math.round(baseTotal * 0.12); // 12% luxury hospitality tax
      const totalPrice = baseTotal + taxAmount;
      const method = normalizePaymentMethod(paymentMethod);
      const payAtDesk = method === 'Pay at Hotel Desk';
      const useStripe = !payAtDesk;
      const storedMethod = payAtDesk ? 'Pay at Hotel Desk' : 'Stripe';
      const holdExpiresAt = payAtDesk ? null : calculateHoldExpiresAt();

      let booking;
      let isReused = false;

      if (existingUserPendingBooking) {
        // Reuse existing pending booking without creating duplicate or throwing "Already Reserved"
        isReused = true;
        existingUserPendingBooking.guestsCount = requestedGuests;
        existingUserPendingBooking.specialRequests = specialRequests ? String(specialRequests).trim() : '';
        existingUserPendingBooking.pricePerNight = rate;
        existingUserPendingBooking.taxAmount = taxAmount;
        existingUserPendingBooking.totalPrice = totalPrice;
        existingUserPendingBooking.paymentMethod = storedMethod;
        existingUserPendingBooking.status = 'Confirmed';
        existingUserPendingBooking.paymentStatus = 'Pending';
        existingUserPendingBooking.holdExpiresAt = holdExpiresAt;
        await existingUserPendingBooking.save();
        booking = existingUserPendingBooking;

        // Sync associated Payment audit record
        let payment = await Payment.findOne({ bookingId: booking._id });
        if (payment) {
          payment.amount = totalPrice;
          payment.paymentMethod = storedMethod;
          payment.status = 'Pending';
          await payment.save();
        } else {
          const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          await Payment.create({
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber,
            userEmail: booking.userEmail,
            userName: booking.userName,
            amount: booking.totalPrice,
            paymentMethod: storedMethod,
            transactionId: `PEND-${booking.bookingNumber}`,
            status: 'Pending',
            invoiceNumber,
            cardLast4: ''
          });
        }
      } else {
        const bookingNumber = generateBookingNumber();
        booking = new Booking({
          bookingNumber,
          userEmail: req.user.email.toLowerCase(),
          userName: req.user.name,
          userPhone: req.user.phone || '',
          roomId: room._id,
          roomName: room.name,
          hotelName: room.hotelName || 'Aatithya Royal Heritage Palace & Spa',
          hotelImage: room.image || room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
          roomNumber: room.roomNumber,
          roomImage: room.image || room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights,
          guestsCount: requestedGuests,
          pricePerNight: rate,
          taxAmount,
          totalPrice,
          status: 'Confirmed',
          paymentStatus: 'Pending',
          holdExpiresAt,
          paymentMethod: storedMethod,
          transactionId: '',
          specialRequests: specialRequests ? String(specialRequests).trim() : ''
        });

        await booking.save();

        const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await Payment.create({
          bookingId: booking._id,
          bookingNumber: booking.bookingNumber,
          userEmail: booking.userEmail,
          userName: booking.userName,
          amount: booking.totalPrice,
          paymentMethod: storedMethod,
          transactionId: `PEND-${bookingNumber}`,
          status: 'Pending',
          invoiceNumber,
          cardLast4: ''
        });
      }

      let checkoutUrl = null;
      let stripeDetails = null;
      let stripeNotice = null;

      if (useStripe) {
        if (isStripeConfigured()) {
          try {
            const { session, inrTotal: convertedInr, eurAmount, exchangeRate } = await createCheckoutSessionForBooking(booking);
            booking.stripeSessionId = session.id;
            booking.currency = 'EUR';
            await booking.save();
            checkoutUrl = session.url;
            stripeDetails = {
              sessionId: session.id,
              checkoutUrl: session.url,
              currency: 'EUR',
              symbol: '€',
              inrTotal: convertedInr,
              eurAmount,
              exchangeRate
            };
          } catch (stripeErr) {
            console.error('Stripe checkout create failed:', stripeErr.message);
            if (!isReused) {
              await Payment.deleteOne({ bookingId: booking._id });
              await Booking.deleteOne({ _id: booking._id });
            }
            return res.status(502).json({
              message: 'Stripe payment gateway encountered an issue. Please try Pay at Hotel Desk or verify your STRIPE_SECRET_KEY in Backend/.env.'
            });
          }
        } else {
          stripeNotice = 'Stripe payment gateway is pending configuration (STRIPE_SECRET_KEY in Backend/.env). Reservation is held safely as Pending.';
        }
      }

      sendBookingConfirmationEmail({
        userEmail: booking.userEmail,
        userName: booking.userName,
        bookingNumber: booking.bookingNumber,
        roomName: booking.roomName,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice
      }).catch(() => {});

      await AdminLog.create({
        action: isReused ? 'Reservation Hold Renewed' : 'Reservation Confirmed',
        performedBy: req.user.email,
        targetEntity: booking.bookingNumber,
        details: `${booking.roomName} reserved for ${nights} nights ($${totalPrice}), payment ${booking.paymentStatus}${isReused ? ' (reused hold)' : ''}`
      });

      const paymentRecord = await Payment.findOne({ bookingId: booking._id });
      const invoiceNumber = paymentRecord ? paymentRecord.invoiceNumber : `INV-2026-${booking.bookingNumber.split('-')[2] || '9901'}`;

      const responseMessage = checkoutUrl
        ? (isReused ? 'Reservation hold renewed. Complete payment on Stripe (£ GBP Checkout) to confirm.' : 'Reservation held. Complete payment on Stripe (£ GBP Checkout) to confirm.')
        : payAtDesk
        ? 'Reservation confirmed. Payment will be collected at hotel desk upon check-in.'
        : 'Reservation held with payment pending. Settle via Stripe (£ GBP) or at hotel desk.';

      return res.status(isReused ? 200 : 201).json({
        message: responseMessage,
        booking,
        invoiceNumber,
        checkoutUrl,
        sessionUrl: checkoutUrl,
        stripeDetails,
        stripeNotice,
        isReused
      });
    });
  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({ message: 'Server error processing booking' });
  }
});

// Helper to auto-reconcile pending Stripe reservations when checked by the guest or staff
const reconcilePendingStripeBookings = async (bookings) => {
  if (!isStripeConfigured() || !Array.isArray(bookings) || bookings.length === 0) return bookings;
  const stripe = getStripe();
  if (!stripe) return bookings;

  let recentSessions = null;

  for (const b of bookings) {
    if (b.paymentStatus === 'Pending' && (b.stripeSessionId || b.paymentMethod === 'Stripe')) {
      try {
        let session = null;
        if (b.stripeSessionId) {
          try {
            session = await stripe.checkout.sessions.retrieve(b.stripeSessionId);
          } catch (e) {
            // ignore
          }
        }

        if (!session || (session.payment_status !== 'paid' && session.status !== 'complete')) {
          if (!recentSessions) {
            recentSessions = await stripe.checkout.sessions.list({ limit: 25 });
          }
          const match = recentSessions?.data?.find(s =>
            (s.client_reference_id === String(b._id) || s.metadata?.bookingId === String(b._id)) &&
            (s.payment_status === 'paid' || s.status === 'complete')
          );
          if (match) {
            session = match;
          }
        }

        if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
          const { markBookingPaidFromStripe } = require('../controllers/stripeWebhook');
          await markBookingPaidFromStripe(session);
          b.paymentStatus = 'Paid';
          b.status = b.status === 'Cancelled' ? b.status : 'Confirmed';
          b.holdExpiresAt = null;
          b.transactionId = session.payment_intent ? String(session.payment_intent) : session.id;
          b.stripeSessionId = session.id;
        }
      } catch (err) {
        // Non-blocking: continue to next booking
      }
    }
  }
  return bookings;
};

// @route   GET /api/bookings/my-bookings
// @route   GET /api/bookings/user
// @desc    Get reservations for current authenticated guest (Protected)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 });
    await reconcilePendingStripeBookings(bookings);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user bookings' });
  }
};
router.get('/my-bookings', protect, getMyBookings);
router.get('/user', protect, getMyBookings);

// @route   GET /api/bookings/user/:email
// @desc    Get all reservations for a specific user (Protected: self or staff/admin)
router.get('/user/:email', protect, async (req, res) => {
  try {
    const targetEmail = req.params.email.toLowerCase();

    // Check ownership
    if (req.user.email.toLowerCase() !== targetEmail && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot access reservations for another guest' });
    }

    const bookings = await Booking.find({ userEmail: targetEmail }).sort({ createdAt: -1 });
    await reconcilePendingStripeBookings(bookings);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user bookings' });
  }
});

// @route   POST /api/bookings/availability
// @desc    Check whether a room is free for the requested dates (Protected)
router.post('/availability', protect, async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'roomId, checkInDate, and checkOutDate are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Selected room not found' });

    const overlappingBooking = await findOverlappingBooking(room._id, checkIn, checkOut);
    if (overlappingBooking) {
      const isUserPendingHold =
        overlappingBooking.userEmail?.toLowerCase() === req.user.email?.toLowerCase() &&
        overlappingBooking.paymentStatus === 'Pending';

      if (isUserPendingHold) {
        return res.json({
          available: true,
          message: 'You have an active pending hold for this suite for the selected dates.',
          pendingBookingId: overlappingBooking._id
        });
      }

      return res.json({
        available: false,
        message: `Suite #${room.roomNumber} is already reserved for those dates.`
      });
    }

    res.json({ available: true, message: 'Room is available for the selected dates.' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability' });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (Staff and Admin only)
router.get('/', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { roomName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookings' });
  }
});

// @route   GET /api/bookings/confirmation/:id
// @desc    Get verified reservation confirmation details with states (Protected: Owner or Staff/Admin)
router.get('/confirmation/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Enforce authorization
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot view details for another guest’s reservation' });
    }

    // Auto-reconcile with Stripe if pending with session
    if (booking.paymentStatus === 'Pending' && booking.stripeSessionId && isStripeConfigured()) {
      try {
        const stripe = getStripe();
        if (stripe) {
          const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
          if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
            const { markBookingPaidFromStripe } = require('../controllers/stripeWebhook');
            await markBookingPaidFromStripe(session);
            booking.paymentStatus = 'Paid';
            booking.status = booking.status === 'Cancelled' ? booking.status : 'Confirmed';
            booking.holdExpiresAt = null;
            booking.transactionId = session.payment_intent ? String(session.payment_intent) : session.id;
          }
        }
      } catch (err) {
        // Non-blocking
      }
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    const room = booking.roomId ? await Room.findById(booking.roomId) : null;

    res.json({
      success: true,
      booking,
      room,
      payment,
      confirmationState: {
        isPaid: booking.paymentStatus === 'Paid',
        isPending: booking.paymentStatus === 'Pending',
        isCancelled: booking.status === 'Cancelled',
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving booking confirmation details' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking with invoice and payment details (Owner or Staff/Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Enforce authorization
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot view details for another guest’s reservation' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });
    res.json({ ...booking.toObject(), payment });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving booking details' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Staff / Admin only)
router.put('/:id/status', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const { status } = req.body;
    const allowedStatuses = ['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    await AdminLog.create({
      action: 'Booking Status Updated',
      performedBy: req.user.email,
      targetEntity: booking.bookingNumber,
      details: `Status changed to ${status}`
    });

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking (Owner or Staff/Admin only)
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify owner or staff
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot cancel another guest’s reservation' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Reservation has already been cancelled' });
    }

    const wasPaid = booking.paymentStatus === 'Paid';
    booking.status = 'Cancelled';
    booking.cancellationReason = reason ? String(reason).trim() : 'Guest self-service cancellation';

    if (wasPaid) {
      booking.refundStatus = 'Refund Processed';
      booking.paymentStatus = 'Refunded';

      if (booking.stripePaymentIntentId && isStripeConfigured()) {
        try {
          const { getStripe } = require('../utils/stripeClient');
          const stripe = getStripe();
          if (stripe) {
            await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
            booking.refundStatus = 'Stripe Refund Processed';
          }
        } catch (refundErr) {
          console.error('Stripe refund notice:', refundErr.message);
          booking.refundStatus = 'Refund pending (Stripe)';
        }
      }
      await Payment.findOneAndUpdate({ bookingId: booking._id }, { status: 'Refunded' });
    } else {
      booking.refundStatus = 'None';
      await Payment.findOneAndUpdate({ bookingId: booking._id }, { status: 'Failed' });
    }

    await booking.save();

    // If room is assigned, set room back to Available if occupied by this booking
    if (booking.roomId) {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'Available', isAvailable: true });
    }

    await AdminLog.create({
      action: 'Booking Cancelled',
      performedBy: req.user.email,
      targetEntity: booking.bookingNumber,
      details: `Reservation cancelled. Refund status: ${booking.refundStatus}`
    });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

module.exports = router;
