const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const CheckInOut = require('../models/CheckInOut');
const ServiceRequest = require('../models/ServiceRequest');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');
const { sendCheckInEmail } = require('../utils/emailService');

// @route   GET /api/staff/stats
// @desc    Operational overview statistics for staff dashboard (Staff/Admin only)
router.get('/stats', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const cleaningRooms = await Room.countDocuments({ status: 'Cleaning' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const checkInsToday = await Booking.countDocuments({
      checkInDate: { $gte: todayStart },
      status: { $in: ['Confirmed', 'Checked-In'] }
    });

    const checkOutsToday = await Booking.countDocuments({
      checkOutDate: { $gte: todayStart },
      status: { $in: ['Checked-In', 'Checked-Out'] }
    });

    const pendingServices = await ServiceRequest.countDocuments({
      status: { $in: ['Requested', 'In Progress'] }
    });

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      checkInsToday,
      checkOutsToday,
      pendingServices
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving staff stats' });
  }
});

// @route   POST /api/staff/checkin
// @desc    Process guest check-in & issue digital keycard (Staff/Admin only)
router.post('/checkin', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    const { bookingId, bookingNumber, staffName, keyCardCode } = req.body;

    let query = {};
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query._id = bookingId;
    } else if (bookingNumber) {
      query.bookingNumber = bookingNumber;
    } else {
      return res.status(400).json({ message: 'Booking ID or booking reference number required' });
    }

    const booking = await Booking.findOne(query);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    if (booking.status === 'Checked-In') {
      return res.status(400).json({ message: `Guest is already checked in to Room #${booking.roomNumber}` });
    }

    booking.status = 'Checked-In';
    await booking.save();

    // Update Room status to Occupied
    const room = await Room.findOne({
      $or: [{ roomNumber: booking.roomNumber }, { name: booking.roomName }]
    });

    if (room) {
      room.status = 'Occupied';
      room.isAvailable = false;
      await room.save();
    }

    const issuedKey = keyCardCode || `AZ-${booking.roomNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    const checkInOutRecord = new CheckInOut({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      guestName: booking.userName,
      guestEmail: booking.userEmail,
      roomNumber: booking.roomNumber,
      checkInTime: new Date(),
      keyCardCode: issuedKey,
      staffName: staffName || req.user.name || 'Front Desk Staff',
      status: 'Active'
    });

    await checkInOutRecord.save();

    await AdminLog.create({
      action: 'Guest Check-In',
      performedBy: req.user.email,
      targetEntity: `Room #${booking.roomNumber}`,
      details: `${booking.userName} checked in. Keycard: ${issuedKey}`
    });

    sendCheckInEmail({
      userEmail: booking.userEmail,
      guestName: booking.userName,
      roomNumber: booking.roomNumber,
      keyCardCode: issuedKey
    }).catch(() => {});

    res.json({
      message: `Guest ${booking.userName} checked in to Room ${booking.roomNumber}`,
      booking,
      checkInOutRecord,
      keyCardCode: issuedKey
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing check-in' });
  }
});

// @route   POST /api/staff/checkout
// @desc    Process guest check-out & flag room for housekeeping (Staff/Admin only)
router.post('/checkout', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    const { bookingId, bookingNumber, inspectionNotes, extraCharges, staffName } = req.body;

    let query = {};
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query._id = bookingId;
    } else if (bookingNumber) {
      query.bookingNumber = bookingNumber;
    } else {
      return res.status(400).json({ message: 'Booking ID or booking reference number required' });
    }

    const booking = await Booking.findOne(query);
    if (!booking) return res.status(404).json({ message: 'Booking reservation not found' });

    booking.status = 'Checked-Out';
    await booking.save();

    // Mark room as Cleaning
    const room = await Room.findOne({
      $or: [{ roomNumber: booking.roomNumber }, { name: booking.roomName }]
    });

    if (room) {
      room.status = 'Cleaning';
      room.isAvailable = false;
      await room.save();
    }

    const record = await CheckInOut.findOne({ bookingNumber: booking.bookingNumber });
    if (record) {
      record.checkOutTime = new Date();
      record.inspectionNotes = inspectionNotes ? String(inspectionNotes).trim() : 'Room inspected: Clean and undamaged.';
      record.extraCharges = Number(extraCharges) || 0;
      record.status = 'Completed';
      await record.save();
    }

    // Automatically create a housekeeping ticket
    await ServiceRequest.create({
      guestName: 'HotelPro Housekeeping System',
      guestEmail: 'system@hotelpro.com',
      roomNumber: booking.roomNumber,
      serviceType: 'Housekeeping',
      details: `Full post-checkout turnover and sanitation required for Room ${booking.roomNumber}. Notes: ${inspectionNotes || 'Standard refresh'}.`,
      priority: 'Urgent',
      status: 'Requested'
    });

    await AdminLog.create({
      action: 'Guest Check-Out',
      performedBy: req.user.email,
      targetEntity: `Room #${booking.roomNumber}`,
      details: `${booking.userName} checked out. Room queued for housekeeping turnover.`
    });

    res.json({
      message: `Guest ${booking.userName} checked out. Room ${booking.roomNumber} queued for housekeeping turnover.`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing check-out' });
  }
});

// @route   GET /api/staff/rooms/status
// @desc    Get complete real-time room housekeeping grid (Staff/Admin only)
router.get('/rooms/status', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room inventory' });
  }
});

// @route   PUT /api/staff/rooms/:id/status
// @desc    Change room status (Staff/Admin only)
router.put('/rooms/:id/status', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    const { status } = req.body;
    const allowed = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.status = status;
    room.isAvailable = status === 'Available';
    await room.save();

    await AdminLog.create({
      action: 'Room Housekeeping Updated',
      performedBy: req.user.email,
      targetEntity: `Room #${room.roomNumber}`,
      details: `Status set to ${status}`
    });

    res.json({ message: `Room ${room.roomNumber} status set to ${status}`, room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room status' });
  }
});

// @route   GET /api/staff/services
// @desc    Get all guest service tickets (Staff/Admin only)
router.get('/services', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (!['Staff', 'Admin'].includes(req.user.role)) {
      query.guestEmail = req.user.email.toLowerCase();
    }
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const services = await ServiceRequest.find(query)
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service requests' });
  }
});

// @route   POST /api/staff/services
// @desc    Create a new guest service ticket (Authenticated user)
router.post('/services', protect, async (req, res) => {
  try {
    const { roomNumber, serviceType, details, priority } = req.body;

    const allowedTypes = ['Room Service Food', 'Housekeeping', 'Maintenance', 'Luggage Assistance', 'Concierge & Transport'];
    const validServiceType = allowedTypes.includes(serviceType) ? serviceType : 'Room Service Food';

    const request = new ServiceRequest({
      guestName: req.user.name,
      guestEmail: req.user.email,
      roomNumber: roomNumber ? String(roomNumber).trim() : '101',
      serviceType: validServiceType,
      details: details ? String(details).trim() : 'In-suite service requested.',
      priority: ['Low', 'Medium', 'Urgent'].includes(priority) ? priority : 'Medium',
      status: 'Requested'
    });

    await request.save();
    res.status(201).json({ message: 'Service ticket submitted to concierge desk', request });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service ticket' });
  }
});

// @route   PUT /api/staff/services/:id
// @desc    Update service ticket status or assigned staff (Staff/Admin only)
router.put('/services/:id', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Service Request ID' });
    }

    const { status, assignedStaff } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Service request not found' });

    if (status) {
      const allowed = ['Requested', 'In Progress', 'Completed', 'Cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
      }
      request.status = status;
      if (status === 'Completed') request.completedAt = new Date();
    }
    if (assignedStaff) request.assignedStaff = String(assignedStaff).trim();

    await request.save();
    res.json({ message: 'Service ticket updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service request' });
  }
});

module.exports = router;
