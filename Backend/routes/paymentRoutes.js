const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { isStripeConfigured } = require('../utils/stripeClient');
const { createCheckoutSessionForBooking } = require('../utils/stripeCheckout');

// @route   POST /api/payments/process
// @desc    Process simulated online payment (Clearly labeled simulation mode)
router.post('/process', protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;

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

    // Calculate final amount server-side from verified booking totalPrice
    const finalAmount = booking.totalPrice;

    // Sanitize card data: NEVER store full card number or CVV
    const rawCard = cardDetails?.cardNumber ? String(cardDetails.cardNumber).replace(/\s/g, '') : '';
    const cardLast4 = rawCard.length >= 4 ? rawCard.slice(-4) : '4242';

    const transactionId = `SIM-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = new Payment({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      userEmail: booking.userEmail,
      userName: booking.userName,
      amount: finalAmount,
      paymentMethod: paymentMethod || 'Credit Card (Simulated)',
      transactionId,
      status: 'Completed',
      invoiceNumber,
      cardLast4
    });

    await payment.save();

    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    booking.transactionId = transactionId;
    await booking.save();

    res.json({
      message: 'Payment simulation completed successfully (Development Mode)',
      isSimulation: true,
      payment,
      transactionId,
      invoiceNumber
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

    if (!isStripeConfigured()) {
      return res.status(503).json({
        message: 'Stripe is not configured. Use Pay at Hotel Desk or enable STRIPE_SECRET_KEY.'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    if (booking.userEmail.toLowerCase() !== req.user.email.toLowerCase() && !['Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You cannot pay for another user’s reservation' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cancelled reservations cannot be paid' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This reservation has already been paid in full' });
    }

    const session = await createCheckoutSessionForBooking(booking);
    booking.stripeSessionId = session.id;
    booking.paymentMethod = 'Stripe';
    await booking.save();

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    res.status(500).json({ message: 'Unable to start Stripe Checkout' });
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
        transactionId: booking.transactionId || `SIM-TXN-${booking.bookingNumber}`,
        paidAt: booking.createdAt,
        paymentMethod: booking.paymentMethod || 'Credit Card (Simulated)',
        cardLast4: '4242'
      };
    }

    const subtotal = booking.nights * booking.pricePerNight;
    const taxRate = 0.12;
    const occupancyTax = Math.round(subtotal * taxRate);
    const resortFee = 25;
    const total = subtotal + occupancyTax + resortFee;

    const invoiceData = {
      hotelInfo: {
        name: 'The Grand Azure Luxury Resort & Spa',
        tagline: 'A HotelPro Signature Hospitality Collection',
        address: '77 Oceanfront Boulevard, Paradise Cove, CA 90265',
        phone: '+1 (800) 555-AZURE',
        email: 'reservations@grandazure.hotelpro.com',
        taxId: 'US-HP-TAX-982144'
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
        ratePerNight: booking.pricePerNight,
        nights: booking.nights,
        subtotal,
        occupancyTax,
        resortFee,
        total: booking.totalPrice || total
      },
      payment: {
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        cardLast4: payment.cardLast4,
        status: booking.paymentStatus,
        paidAt: payment.paidAt,
        simulationNotice:
          booking.paymentMethod === 'Stripe'
            ? 'Paid via Stripe Checkout.'
            : 'Simulated transaction for academic and demonstration purposes.'
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

module.exports = router;
