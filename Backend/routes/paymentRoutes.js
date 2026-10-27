const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { isStripeConfigured, getStripe } = require('../utils/stripeClient');
const { createCheckoutSessionForBooking } = require('../utils/stripeCheckout');
const {
  calculateInrAmount,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  getRazorpayInstance,
  getRazorpayKeyId,
  getRazorpayWebhookSecret
} = require('../utils/razorpayClient');
const { sendBookingConfirmationEmail } = require('../utils/emailService');
const { findOverlappingBooking, calculateHoldExpiresAt } = require('../utils/bookingAvailability');
const AdminLog = require('../models/AdminLog');

// @route   POST /api/payments/process
// @desc    Reject simulated online payment - transactions must be genuinely verified
router.post('/process', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization: Must be booking owner or staff/admin
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay for another user’s reservation' });
    }

    // Check duplicate payment
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This reservation has already been paid in full' });
    }

    // Simulated card transactions cannot mark reservations as paid
    return res.status(400).json({
      message: 'Simulated card transactions cannot mark reservations as paid. Verified payment provider required.',
      paymentStatus: booking.paymentStatus
    });
  } catch (error) {
    console.error('Payment processing error:', error.message);
    res.status(500).json({ message: 'Error processing payment transaction' });
  }
});

// @route   POST /api/payments/checkout
// @desc    Create a Stripe Checkout session for a pending booking (owner or staff)
router.post('/checkout', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization: Must be booking owner or staff/admin
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay for another user’s reservation' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cancelled reservations cannot be paid' });
    }

    // Check duplicate payment
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This reservation has already been paid in full' });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        message: 'Stripe is not configured. Use Pay at Hotel Desk or enable STRIPE_SECRET_KEY.'
      });
    }

    // Check if room is still available if hold had expired
    const isHoldExpired = booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= new Date();
    if (isHoldExpired) {
      const overlapping = await findOverlappingBooking(booking.roomId, booking.checkInDate, booking.checkOutDate, booking._id);
      if (overlapping) {
        return res.status(409).json({
          message: 'The hold on this reservation has expired and the room was reserved by another guest. Please select different dates or another suite.',
          code: 'HOLD_EXPIRED_UNAVAILABLE'
        });
      }
    }

    const stripe = getStripe();
    if (booking.stripeSessionId && stripe) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
        if (existingSession && (existingSession.payment_status === 'paid' || existingSession.status === 'complete')) {
          const { markBookingPaidFromStripe } = require('../controllers/stripeWebhook');
          await markBookingPaidFromStripe(existingSession);
          const updated = await Booking.findById(booking._id);
          return res.json({
            success: true,
            alreadyPaid: true,
            message: 'Reservation has already been paid on Stripe',
            booking: updated
          });
        }
        if (existingSession && existingSession.status === 'open' && existingSession.url) {
          const { convertInrToEur } = require('../utils/currencyConverter');
          const inrTotal = booking.totalPriceInr || Math.round(Number(booking.totalPrice) * 83);
          const { eurAmount, exchangeRate } = convertInrToEur(inrTotal);
          return res.json({
            success: true,
            checkoutUrl: existingSession.url,
            sessionId: existingSession.id,
            reused: true,
            inrTotal,
            eurAmount,
            currency: 'EUR',
            symbol: '€',
            exchangeRate
          });
        }
      } catch (checkErr) {
        // Fallback to creating fresh session
      }
    }

    const { session, inrTotal, eurAmount, exchangeRate } = await createCheckoutSessionForBooking(booking);
    booking.stripeSessionId = session.id;
    booking.paymentMethod = 'Stripe';
    booking.currency = 'EUR';
    booking.holdExpiresAt = calculateHoldExpiresAt();
    await booking.save();

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      inrTotal,
      eurAmount,
      currency: 'EUR',
      symbol: '€',
      exchangeRate
    });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    res.status(500).json({ message: 'Unable to start Stripe Checkout' });
  }
});

// @route   POST /api/payments/stripe/verify
// @desc    Verify Stripe Checkout session completion and confirm reservation
router.post('/stripe/verify', protect, async (req, res) => {
  try {
    const { bookingId, sessionId } = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization: Must be owner or staff/admin
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot verify payment for another user’s reservation' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.json({ success: true, message: 'Reservation has already been paid in full', booking });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe is not configured on the server' });
    }

    // Robust session lookup: Prioritize authentic DB session ID, fallback to request sessionId
    const sessionCandidates = [booking.stripeSessionId, sessionId].filter(Boolean);
    const uniqueCandidates = [...new Set(sessionCandidates)];

    let session = null;
    let lastRetrieveErr = null;

    for (const sid of uniqueCandidates) {
      try {
        const retrieved = await stripe.checkout.sessions.retrieve(sid);
        if (retrieved) {
          session = retrieved;
          if (retrieved.payment_status === 'paid' || retrieved.status === 'complete') {
            break;
          }
        }
      } catch (err) {
        lastRetrieveErr = err.message;
      }
    }

    // Deep search in case a concurrent or previous session for this booking was paid
    if (!session || (session.payment_status !== 'paid' && session.status !== 'complete')) {
      try {
        const recentSessions = await stripe.checkout.sessions.list({ limit: 25 });
        const paidMatch = recentSessions?.data?.find(s =>
          (s.client_reference_id === String(booking._id) || s.metadata?.bookingId === String(booking._id)) &&
          (s.payment_status === 'paid' || s.status === 'complete')
        );
        if (paidMatch) {
          session = paidMatch;
        }
      } catch (listErr) {
        // Non-blocking
      }
    }

    if (!session) {
      return res.status(400).json({
        message: 'Unable to locate session on Stripe. Please retry or contact concierge.',
        details: lastRetrieveErr
      });
    }

    if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
      const { markBookingPaidFromStripe } = require('../controllers/stripeWebhook');
      await markBookingPaidFromStripe(session);
      const updatedBooking = await Booking.findById(bookingId);
      return res.json({
        success: true,
        message: 'Stripe payment verified successfully in Euros (€)',
        booking: updatedBooking
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Stripe payment is not marked as paid yet.',
      paymentStatus: session?.payment_status
    });
  } catch (err) {
    console.error('Stripe verification error:', err.message);
    res.status(500).json({ message: 'Error verifying Stripe payment session', error: err.message });
  }
});

// @route   GET /api/payments/invoice/:bookingId
// @desc    Generate printable digital tax invoice (Protected: Owner or Staff/Admin)
router.get('/invoice/:bookingId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: 'Invalid Booking ID' });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization check
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot access invoices for other guests' });
    }

    let payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      payment = {
        invoiceNumber: `INV-2026-${booking.bookingNumber.split('-')[2] || '9901'}`,
        transactionId: booking.transactionId || (booking.paymentStatus === 'Paid' ? `TXN-${booking.bookingNumber}` : 'UNPAID'),
        paidAt: booking.paymentStatus === 'Paid' ? booking.updatedAt : null,
        paymentMethod: booking.paymentMethod || 'Pending Verification',
        cardLast4: 'N/A'
      };
    }

    const transactionCurrency = (payment && payment.currency)
      ? payment.currency
      : (booking.currency || 'USD');

    const currencySymbols = {
      EUR: '€',
      USD: '$',
      INR: '₹',
      GBP: '£'
    };
    const currencySymbol = currencySymbols[String(transactionCurrency).toUpperCase()] || '$';

    let subtotal, occupancyTax, total, ratePerNight, roundingAdjustment;

    if (payment && payment.status === 'Completed' && typeof payment.amount === 'number' && (payment.amount !== booking.totalPrice || (payment.currency && payment.currency !== 'USD'))) {
      // Converted transaction (e.g. 1571.72 EUR charged via Stripe)
      total = payment.amount;
      const nights = Math.max(1, Number(booking.nights) || 1);
      const unroundedBase = total / 1.12;
      ratePerNight = Math.round((unroundedBase / nights) * 100) / 100;
      subtotal = Math.round(ratePerNight * nights * 100) / 100;
      occupancyTax = Math.round(subtotal * 0.12 * 100) / 100;
      roundingAdjustment = Math.round((total - (subtotal + occupancyTax)) * 100) / 100;
    } else {
      // Standard base rate calculation
      const nights = Math.max(1, Number(booking.nights) || 1);
      ratePerNight = Number(booking.pricePerNight) || 0;
      subtotal = Math.round(nights * ratePerNight * 100) / 100;
      occupancyTax = typeof booking.taxAmount === 'number' && !isNaN(booking.taxAmount)
        ? booking.taxAmount
        : Math.round(subtotal * 0.12 * 100) / 100;
      total = (payment && typeof payment.amount === 'number') ? payment.amount : (booking.totalPrice || Math.round((subtotal + occupancyTax) * 100) / 100);
      roundingAdjustment = (payment && typeof payment.amount === 'number')
        ? Math.round((total - (subtotal + occupancyTax)) * 100) / 100
        : 0;
    }

    const hotelBrand = booking.hotelName
      ? (booking.hotelName.toLowerCase().includes('aatithya')
          ? booking.hotelName
          : `Aatithya ${booking.hotelName.replace(/^HotelPro\s+/i, '')}`)
      : 'Aatithya Royal Heritage Palace & Spa';

    const invoiceData = {
      hotelInfo: {
        name: hotelBrand,
        tagline: 'Aatithya — Royal Indian Hospitality | Atithi Devo Bhava',
        address: 'Udaivilas Road, Lake Pichola, Udaipur, Rajasthan 313001',
        phone: '+91 (11) 4567-8900',
        email: 'concierge@aatithya.in',
        taxId: 'IN-GST-AATITHYA-27AABCU9603R1ZM'
      },
      invoiceNumber: payment.invoiceNumber,
      issueDate: new Date().toISOString(),
      bookingDetails: {
        bookingNumber: booking.bookingNumber,
        guestName: booking.userName,
        guestEmail: booking.userEmail,
        guestPhone: booking.userPhone || '+1 (555) 019-2834',
        roomName: booking.roomName,
        roomNumber: booking.roomNumber,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        nights: booking.nights,
        guestsCount: booking.guestsCount
      },
      charges: {
        currency: transactionCurrency,
        currencySymbol,
        ratePerNight,
        nights: booking.nights,
        subtotal,
        occupancyTax,
        roundingAdjustment: roundingAdjustment || 0,
        resortFee: 0,
        total
      },
      payment: {
        currency: transactionCurrency,
        currencySymbol,
        amount: (payment && typeof payment.amount === 'number') ? payment.amount : total,
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        cardLast4: payment.cardLast4,
        status: booking.paymentStatus,
        paidAt: payment.paidAt,
        simulationNotice:
          booking.paymentStatus === 'Paid'
            ? 'Verified payment received.'
            : booking.paymentMethod === 'Pay at Hotel Desk'
            ? 'Payment to be collected at hotel desk upon check-in.'
            : 'Payment pending verified completion.'
      },
      verificationQr: `HOTELPRO-VERIFIED-${booking.bookingNumber}-${payment.invoiceNumber}`
    };

    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice details' });
  }
});

// @route   GET /api/payments/history
// @desc    Get all payment audits (Admin only)
router.get('/history', protect, authorize('Admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find()
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payment records' });
  }
});

// @route   POST /api/payments/razorpay/order
// @desc    Create a Razorpay order in INR for a pending reservation
router.post('/razorpay/order', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization: Must be booking owner or staff/admin
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay for another user’s reservation' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cancelled reservations cannot be paid' });
    }

    // Expiry check
    if (new Date(booking.checkOutDate) < new Date()) {
      return res.status(400).json({ message: 'This reservation date has expired and cannot be paid' });
    }

    // Duplicate payment check
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This reservation has already been paid in full' });
    }

    // Check if room is still available if hold had expired
    const isHoldExpired = booking.holdExpiresAt && new Date(booking.holdExpiresAt) <= new Date();
    if (isHoldExpired) {
      const overlapping = await findOverlappingBooking(booking.roomId, booking.checkInDate, booking.checkOutDate, booking._id);
      if (overlapping) {
        return res.status(409).json({
          message: 'The hold on this reservation has expired and the room was reserved by another guest. Please select different dates or another suite.',
          code: 'HOLD_EXPIRED_UNAVAILABLE'
        });
      }
    }

    // Server-calculated INR amount in paise
    const { inrTotal, amountInPaise, rate } = calculateInrAmount(booking.totalPrice);

    const instance = getRazorpayInstance();
    if (!instance) {
      return res.status(503).json({
        message: 'Razorpay Test Mode is not configured on the server. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Backend/.env, or choose Pay at Hotel Desk.',
        code: 'RAZORPAY_NOT_CONFIGURED'
      });
    }

    let order;
    try {
      order = await instance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: booking.bookingNumber,
        notes: {
          bookingId: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          userEmail: booking.userEmail
        }
      });
    } catch (rzpErr) {
      console.error('Razorpay live order error:', rzpErr.message || rzpErr.error);
      const isAuthError = rzpErr.statusCode === 401 || (rzpErr.error && rzpErr.error.description === 'Authentication failed');
      const clientMessage = isAuthError
        ? 'Razorpay authentication failed: Invalid Key ID or Secret. Please configure valid Razorpay Test Mode credentials in Backend/.env, or choose "Pay at Hotel Desk".'
        : (rzpErr.error?.description || rzpErr.message || 'Failed to create Razorpay payment order');
      return res.status(isAuthError ? 401 : 502).json({
        message: clientMessage,
        code: isAuthError ? 'RAZORPAY_AUTH_FAILED' : 'RAZORPAY_ORDER_FAILED'
      });
    }

    booking.razorpayOrderId = order.id;
    booking.paymentMethod = 'Razorpay';
    booking.holdExpiresAt = calculateHoldExpiresAt();
    await booking.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      inrTotal,
      usdTotal: booking.totalPrice,
      exchangeRate: rate,
      keyId: getRazorpayKeyId(),
      booking: {
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        hotelName: booking.hotelName,
        roomName: booking.roomName
      }
    });
  } catch (error) {
    console.error('Razorpay order endpoint error:', error.message);
    res.status(500).json({ message: 'Error processing Razorpay order request' });
  }
});

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment signature and mark reservation as Paid
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Razorpay order ID, payment ID, and signature are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    // Authorization: Must be booking owner or staff/admin
    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay for another user’s reservation' });
    }

    // Duplicate payment check
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This reservation has already been paid in full' });
    }

    // Verify stored order ID matches the verification payload
    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch. Payment verification failed.' });
    }

    // Secure signature verification
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
    }

    // Server-side verification of payment record if instance is available
    const instance = getRazorpayInstance();
    if (instance) {
      try {
        const paymentRecord = await instance.payments.fetch(razorpay_payment_id);
        if (paymentRecord) {
          if (paymentRecord.order_id && paymentRecord.order_id !== razorpay_order_id) {
            return res.status(400).json({ message: 'Payment entity does not match the specified order ID.' });
          }
          if (paymentRecord.currency && paymentRecord.currency !== 'INR') {
            return res.status(400).json({ message: 'Payment currency mismatch.' });
          }
        }
      } catch (fetchErr) {
        console.warn('Razorpay payment fetch notice:', fetchErr.message);
      }
    }

    // Update booking to Paid
    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    booking.holdExpiresAt = null;
    booking.paymentMethod = 'Razorpay';
    booking.transactionId = razorpay_payment_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpaySignature = razorpay_signature;
    await booking.save();

    // Update or create Payment record
    const invoiceNumber = `INV-2026-${booking.bookingNumber.split('-')[2] || Math.floor(1000 + Math.random() * 9000)}`;
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      {
        bookingNumber: booking.bookingNumber,
        userEmail: booking.userEmail,
        userName: booking.userName,
        amount: booking.totalPrice,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        transactionId: razorpay_payment_id,
        status: 'Completed',
        invoiceNumber,
        paidAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

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
      action: 'Payment Verified (Razorpay)',
      performedBy: req.user.email,
      targetEntity: booking.bookingNumber,
      details: `Razorpay payment ${razorpay_payment_id} verified for reservation ${booking.bookingNumber}`
    });

    res.json({
      success: true,
      message: 'Razorpay payment verified and reservation confirmed!',
      booking
    });
  } catch (error) {
    console.error('Razorpay verification error:', error.message);
    res.status(500).json({ message: 'Error verifying Razorpay payment' });
  }
});

// @route   POST /api/payments/razorpay/failed
// @desc    Record failed payment attempt and permit retry
router.post('/razorpay/failed', protect, async (req, res) => {
  try {
    const { bookingId, errorDescription } = req.body;
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Valid Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access to reservation' });
    }

    if (booking.paymentStatus !== 'Paid') {
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        {
          status: 'Failed',
          failureReason: errorDescription || 'Payment attempt failed or was dismissed by user'
        }
      );
    }

    res.json({
      message: 'Payment failure recorded. Reservation remains pending and can be retried.',
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      holdExpiresAt: booking.holdExpiresAt,
      canRetry: booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment failure' });
  }
});

// @route   POST /api/payments/razorpay/webhook
// @desc    Handle Razorpay Webhooks (signature verified, idempotent)
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = getRazorpayWebhookSecret();

    // Reject unsigned webhooks
    if (!signature) {
      return res.status(400).json({ message: 'Missing x-razorpay-signature header. Webhook rejected.' });
    }
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Razorpay webhook secret is not configured on the server.' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature. Verification failed.' });
    }

    const payload = req.body;
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || payload?.payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id;

    if (event === 'payment.captured' || event === 'order.paid') {
      const booking = await Booking.findOne({
        $or: [
          { razorpayOrderId: orderId },
          { bookingNumber: paymentEntity?.notes?.bookingNumber }
        ]
      });

      if (booking) {
        // Idempotent duplicate webhook protection
        if (booking.paymentStatus === 'Paid') {
          return res.status(200).json({ status: 'already_processed' });
        }

        booking.paymentStatus = 'Paid';
        booking.status = 'Confirmed';
        booking.paymentMethod = 'Razorpay';
        booking.transactionId = paymentId || booking.transactionId;
        booking.razorpayPaymentId = paymentId || booking.razorpayPaymentId;
        await booking.save();

        await Payment.findOneAndUpdate(
          { bookingId: booking._id },
          {
            status: 'Completed',
            transactionId: paymentId || booking.transactionId,
            paymentMethod: 'Razorpay',
            currency: 'INR',
            paidAt: new Date()
          }
        );
      }
    } else if (event === 'payment.failed') {
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      if (booking && booking.paymentStatus !== 'Paid') {
        await Payment.findOneAndUpdate({ bookingId: booking._id }, { status: 'Failed' });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error.message);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

module.exports = router;
