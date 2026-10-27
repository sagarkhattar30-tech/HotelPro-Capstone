const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');
const { getOverlappingBookingRoomIds } = require('../utils/bookingAvailability');
const { getMatchingHeritageSuites, getHeritageSuiteById, getPropertyImages } = require('../utils/heritageHotelsData');

// @route   GET /api/rooms
// @desc    Get all rooms with dynamic search, filtering, and date-range availability check (Public)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      capacity,
      search,
      status,
      amenity,
      hotel,
      city,
      checkInDate,
      checkOutDate
    } = req.query;

    let query = {};
    const andConditions = [];

    // Filter out rooms that have overlapping active reservations for requested dates
    let bookedRoomIds = [];
    if (checkInDate && checkOutDate) {
      bookedRoomIds = await getOverlappingBookingRoomIds(checkInDate, checkOutDate);
      if (bookedRoomIds.length > 0) {
        query._id = { $nin: bookedRoomIds };
      }
    }

    if (hotel && hotel !== 'All') {
      const cleanHotel = hotel.replace(/^(HotelPro|Aatithya)\s+/i, '').trim();
      const escaped = cleanHotel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      andConditions.push({
        $or: [
          { hotelName: { $regex: escaped, $options: 'i' } },
          { location: { $regex: escaped, $options: 'i' } },
          { city: { $regex: escaped, $options: 'i' } }
        ]
      });
    }

    if (city && city !== 'All') {
      andConditions.push({
        $or: [
          { city: { $regex: city, $options: 'i' } },
          { location: { $regex: city, $options: 'i' } }
        ]
      });
    }

    if (type && type !== 'All') {
      const singularType = type.replace(/s$/i, '');
      query.type = { $regex: singularType, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { roomNumber: { $regex: search, $options: 'i' } },
          { hotelName: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (amenity && amenity !== 'All') {
      query.amenities = { $in: [amenity] };
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const dbRooms = await Room.find(query).sort({ featured: -1, pricePerNight: 1 });
    const normalizedDbRooms = dbRooms.map((r) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (!Array.isArray(obj.images) || obj.images.length <= 1) {
        obj.images = getPropertyImages(obj.hotelName, obj.image);
      }
      return obj;
    });

    // Match heritage suites for existing Indian hotel records
    let heritageSuites = getMatchingHeritageSuites(req.query);
    if (bookedRoomIds.length > 0) {
      const bookedSet = new Set(bookedRoomIds.map(String));
      heritageSuites = heritageSuites.filter((s) => !bookedSet.has(String(s._id)));
    }

    // Deduplicate by stable room _id and roomNumber (live DB rooms take precedence)
    const seenIds = new Set();
    const seenRoomNumbers = new Set();
    const allRooms = [];

    // Prioritize live database rooms (which hold persistent housekeeping status and availability)
    for (const r of normalizedDbRooms) {
      const idStr = String(r._id);
      seenIds.add(idStr);
      if (r.roomNumber) seenRoomNumbers.add(r.roomNumber);
      allRooms.push(r);
    }

    // Append heritage suites only if not already present in database rooms
    for (const s of heritageSuites) {
      const idStr = String(s._id);
      if (!seenIds.has(idStr) && (!s.roomNumber || !seenRoomNumbers.has(s.roomNumber))) {
        seenIds.add(idStr);
        if (s.roomNumber) seenRoomNumbers.add(s.roomNumber);
        allRooms.push(s);
      }
    }

    res.json(allRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID with reviews (Public)
router.get('/:id', async (req, res) => {
  try {
    let room = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      room = await Room.findById(req.params.id);
    }
    if (!room) {
      const heritageRoom = getHeritageSuiteById(req.params.id);
      if (heritageRoom) {
        const reviews = await Review.find({ roomId: heritageRoom._id }).sort({ createdAt: -1 });
        return res.json({ ...heritageRoom, reviews });
      }
      return res.status(404).json({ message: 'Room not found' });
    }
    const reviews = await Review.find({ roomId: room._id }).sort({ createdAt: -1 });
    const roomObj = room.toObject();
    if (!Array.isArray(roomObj.images) || roomObj.images.length <= 1) {
      roomObj.images = getPropertyImages(roomObj.hotelName, roomObj.image);
    }
    res.json({ ...roomObj, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room details', error: error.message });
  }
});

// @route   POST /api/rooms
// @desc    Create a new luxury room (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const {
      roomNumber,
      name,
      type,
      pricePerNight,
      capacity,
      bedType,
      sizeSqFt,
      floor,
      image,
      images,
      description,
      amenities,
      featured,
      seasonalPricing
    } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: `Room number ${roomNumber} already exists` });
    }

    const newRoom = new Room({
      roomNumber,
      name,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity) || 2,
      bedType: bedType || 'King Bed',
      sizeSqFt: Number(sizeSqFt) || 500,
      floor: Number(floor) || 1,
      image: image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
      images: images && images.length ? images : [image],
      description,
      amenities: amenities || ['High-Speed WiFi', 'Climate Control'],
      featured: !!featured,
      seasonalPricing: seasonalPricing || []
    });

    await newRoom.save();

    await AdminLog.create({
      action: 'Room Created',
      performedBy: req.user.email,
      targetEntity: `Room ${newRoom.roomNumber}`,
      details: `Added new ${newRoom.type}: ${newRoom.name} at $${newRoom.pricePerNight}/night`
    });

    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room details (Admin or Staff)
router.put('/:id', protect, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      room[key] = updates[key];
    });

    await room.save();

    await AdminLog.create({
      action: 'Room Updated',
      performedBy: req.user.email,
      targetEntity: `Room ${room.roomNumber}`,
      details: `Updated details for ${room.name} (Status: ${room.status}, Price: $${room.pricePerNight})`
    });

    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await Room.findByIdAndDelete(req.params.id);

    await AdminLog.create({
      action: 'Room Deleted',
      performedBy: req.user.email,
      targetEntity: `Room ${room.roomNumber}`,
      details: `Deleted room ${room.name}`
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

module.exports = router;
