const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/auth');
const User = require('../models/User');

// Optional auth middleware: extracts user if token provided, but allows guests without token
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } catch {
      // ignore expired or invalid tokens for guest support submissions
    }
  }
  next();
};

// Curated FAQs for quick self-help
const FAQS = [
  {
    id: 'housekeeping-status',
    category: 'Housekeeping',
    question: 'How do I change room status in the Housekeeping Grid?',
    answer: 'Navigate to the Housekeeping Grid from the Operations menu in your Dashboard. Each room card displays its current status badge (Available, Occupied, Cleaning, Maintenance). Select any desired status from the dropdown or click the status buttons to immediately update the room inventory. The system logs the change and updates the front desk instantly.'
  },
  {
    id: 'digital-keycard',
    category: 'Check-In & Access',
    question: 'How do I receive my digital keycard for suite entry?',
    answer: 'Once your reservation is confirmed, click "Digital Keycard" on your booking card or visit the Front Desk section. A secure encrypted alphanumeric access code (e.g. HP-101-4921) is issued upon check-in and stored in your profile.'
  },
  {
    id: 'cancel-modify',
    category: 'Reservations',
    question: 'Can I cancel or modify my reservation dates?',
    answer: 'Reservations can be canceled or rescheduled up to 24 hours prior to check-in through "My Bookings" with a 100% refund. For special modifications within 24 hours, contact the 24/7 Royal Concierge desk directly.'
  },
  {
    id: 'payment-methods',
    category: 'Payments & Invoices',
    question: 'Which payment methods are accepted and how do currency conversions work?',
    answer: 'We support all major debit/credit cards, UPI, and international credit cards via Stripe and Razorpay. Tariffs can be viewed and settled in Indian Rupees (₹ INR), British Pounds (£ GBP), or US Dollars ($ USD). Invoices with complete GST breakdowns can be viewed and printed anytime.'
  },
  {
    id: 'room-service',
    category: 'Concierge Services',
    question: 'How do I request extra linen, housekeeping turndown, or dining?',
    answer: 'Submit a ticket directly through the Support & Service Desk or dial 0 from your suite phone. Our staff typically responds within 10–15 minutes.'
  }
];

// @route   GET /api/support/faqs
// @desc    Get instant self-help FAQs
router.get('/faqs', (req, res) => {
  res.json(FAQS);
});

// @route   GET /api/support/contacts
// @desc    Get 24/7 concierge contact info
router.get('/contacts', (req, res) => {
  res.json({
    tollFree: '1800-AATITHYA (1800-228-4849)',
    landline: '+91 (11) 4567-8900',
    whatsapp: '+91 98765 43210',
    email: 'concierge@aatithya-hotels.com',
    supportEmail: 'support@hotelpro.com',
    dutyHours: '24 Hours / 7 Days a Week (365 Days)',
    headquarters: 'Aatithya Royal Hospitality, Palace Road, New Delhi 110001, India'
  });
});

// @route   POST /api/support/ticket
// @desc    Submit a support ticket for any problem (Guest, Staff, or Admin)
router.post('/ticket', optionalAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      category,
      roomNumber,
      bookingNumber,
      subject,
      description,
      priority
    } = req.body;

    const guestName = (req.user?.name || name || 'Valued Guest').trim();
    const guestEmail = (req.user?.email || email || 'guest@aatithya-hotels.com').trim().toLowerCase();
    const room = roomNumber ? String(roomNumber).trim() : 'General Inquiry';
    const desc = (description || '').trim();

    if (!desc) {
      return res.status(400).json({ message: 'Please provide a description of the problem or request.' });
    }

    // Generate unique Palace Support Ticket Reference
    const ticketCode = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    // Map category to ServiceRequest enum
    let serviceType = 'Concierge & Transport';
    if (category === 'Housekeeping') serviceType = 'Housekeeping';
    else if (category === 'Maintenance' || category === 'Technical Issue') serviceType = 'Maintenance';
    else if (category === 'Dining') serviceType = 'Room Service Food';

    const fullDetails = `[Ticket ${ticketCode}] Category: ${category || 'General Support'}${
      subject ? ` | Subject: ${subject}` : ''
    }${bookingNumber ? ` | Booking: ${bookingNumber}` : ''}${
      phone ? ` | Phone: ${phone}` : ''
    }\nDetails: ${desc}`;

    // Create ServiceRequest in database
    const ticketRequest = new ServiceRequest({
      guestName,
      guestEmail,
      roomNumber: room,
      serviceType,
      details: fullDetails,
      priority: ['Low', 'Medium', 'Urgent'].includes(priority) ? priority : 'Medium',
      status: 'Requested'
    });

    await ticketRequest.save();

    // Create Staff & Admin Notification
    try {
      await Notification.create({
        role: 'Staff',
        title: `🚨 Support Ticket ${ticketCode} (${category || 'Assistance'})`,
        message: `${guestName} reported: "${desc.slice(0, 100)}${desc.length > 100 ? '...' : ''}" (Room/Ref: ${room})`,
        type: 'service',
        isRead: false
      });

      await AdminLog.create({
        action: 'Support Ticket Logged',
        performedBy: guestEmail,
        targetEntity: `Ticket #${ticketCode}`,
        details: `Category: ${category || 'Support'} - Priority: ${priority || 'Medium'}`
      });
    } catch (notifErr) {
      console.warn('Non-fatal support notification error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      ticketCode,
      message: `Your support request #${ticketCode} has been submitted to the Palace Concierge Desk. Our duty team will attend to you shortly.`,
      ticket: ticketRequest
    });
  } catch (error) {
    console.error('Error logging support ticket:', error);
    res.status(500).json({ message: 'Could not log support ticket. Please call our 24/7 hotline directly.' });
  }
});

module.exports = router;
