const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/rooms
// @desc    Get all rooms with dynamic search and filtering
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, capacity, search, status, amenity, hotel, city } = req.query;
    let query = {};

    if (hotel && hotel !== 'All') {
      query.hotelName = { $regex: hotel, $options: 'i' };
    }

    if (city && city !== 'All') {
      query.$or = [
        { city: { $regex: city, $options: 'i' } },
        { location: { $regex: city, $options: 'i' } }
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
        { hotelName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (amenity && amenity !== 'All') {
      query.amenities = { $in: [amenity] };
    }

    const rooms = await Room.find(query).sort({ featured: -1, pricePerNight: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID with reviews
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const reviews = await Review.find({ roomId: room._id }).sort({ createdAt: -1 });
    res.json({ ...room.toObject(), reviews });
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
