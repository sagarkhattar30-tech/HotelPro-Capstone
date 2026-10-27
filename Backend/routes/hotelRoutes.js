
const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');
const { getMatchingHeritageSuites, getPropertyImages } = require('../utils/heritageHotelsData');

// @route   GET /api/hotels
// @desc    Get all luxury hotels & resort properties with room counts (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const { city, search } = req.query;
    let query = {};

    if (city && city !== 'All') {
      query.$or = [
        { city: { $regex: city, $options: 'i' } },
        { location: { $regex: city, $options: 'i' } }
      ];
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(query).sort({ featured: -1, starRating: -1 });

    // Populate total rooms count dynamically
    const enrichedHotels = await Promise.all(
      hotels.map(async (h) => {
        let totalRooms = await Room.countDocuments({ hotelName: h.name });
        let availableRooms = await Room.countDocuments({ hotelName: h.name, status: 'Available' });
        if (!totalRooms) {
          const suites = getMatchingHeritageSuites({ hotel: h.name });
          totalRooms = suites.length;
          availableRooms = suites.filter((s) => s.isAvailable).length;
        }
        const obj = h.toObject();
        if (!Array.isArray(obj.images) || obj.images.length <= 1) {
          obj.images = getPropertyImages(obj.name, obj.image);
        }
        if (!obj.image || typeof obj.image !== 'string' || !obj.image.startsWith('http')) {
          obj.image = obj.images[0];
        }
        return {
          ...obj,
          totalRooms: totalRooms || 4,
          availableRooms: availableRooms || 3
        };
      })
    );

    res.json(enrichedHotels);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving hotels', error: error.message });
  }
});

// @route   GET /api/hotels/:id
// @desc    Get hotel details and its associated suites (Protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel property not found' });

    let rooms = await Room.find({ $or: [{ hotelId: hotel._id }, { hotelName: hotel.name }] });
    if (!rooms || rooms.length === 0) {
      rooms = getMatchingHeritageSuites({ hotel: hotel.name });
    } else {
      rooms = rooms.map((r) => {
        const robj = r.toObject ? r.toObject() : { ...r };
        if (!Array.isArray(robj.images) || robj.images.length <= 1) {
          robj.images = getPropertyImages(robj.hotelName || hotel.name, robj.image);
        }
        return robj;
      });
    }

    const hotelObj = hotel.toObject();
    if (!Array.isArray(hotelObj.images) || hotelObj.images.length <= 1) {
      hotelObj.images = getPropertyImages(hotelObj.name, hotelObj.image);
    }
    if (!hotelObj.image || typeof hotelObj.image !== 'string' || !hotelObj.image.startsWith('http')) {
      hotelObj.image = hotelObj.images[0];
    }

    res.json({ ...hotelObj, rooms });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving hotel details', error: error.message });
  }
});

// @route   POST /api/hotels
// @desc    Add new hotel property (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    await newHotel.save();

    await AdminLog.create({
      action: 'Hotel Property Added',
      performedBy: req.user.email,
      targetEntity: newHotel.name,
      details: `Added new hotel in ${newHotel.location}`
    });

    res.status(201).json({ message: 'Hotel property created successfully', hotel: newHotel });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel property', error: error.message });
  }
});

// @route   PUT /api/hotels/:id
// @desc    Update hotel property (Admin only)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel property not found' });

    res.json({ message: 'Hotel property updated', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel property', error: error.message });
  }
});

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel property (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hotel property removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hotel property', error: error.message });
  }
});

module.exports = router;
