const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const AdminLog = require('../models/AdminLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/hotels
// @desc    Get all luxury hotels & resort properties with room counts
router.get('/', async (req, res) => {
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
        const totalRooms = await Room.countDocuments({ hotelName: h.name });
        const availableRooms = await Room.countDocuments({ hotelName: h.name, status: 'Available' });
        return {
          ...h.toObject(),
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
// @desc    Get hotel details and its associated suites
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel property not found' });

    const rooms = await Room.find({ $or: [{ hotelId: hotel._id }, { hotelName: hotel.name }] });
    res.json({ ...hotel.toObject(), rooms });
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
