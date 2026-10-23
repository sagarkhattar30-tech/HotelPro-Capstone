const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    List recent reviews (authenticated — used by UnifiedDashboard)
router.get('/', protect, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(100);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// @route   GET /api/reviews/room/:roomId
// @desc    Get all reviews for a specific room (Public)
router.get('/room/:roomId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    const reviews = await Review.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Submit guest review for a room (Protected: authenticated user only)
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;

    if (!roomId || !rating || !comment) {
      return res.status(400).json({ message: 'Room ID, rating, and feedback comment are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'Invalid Room ID' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5 stars' });
    }

    const trimmedComment = String(comment).trim();
    if (trimmedComment.length < 5) {
      return res.status(400).json({ message: 'Please provide a review comment with at least 5 characters' });
    }

    // Derive verified reviewer from req.user
    const review = new Review({
      roomId: room._id,
      roomName: room.name,
      userEmail: req.user.email,
      userName: req.user.name,
      rating: Math.round(numRating),
      comment: trimmedComment
    });

    await review.save();

    // Recalculate average rating for room
    const allReviews = await Review.find({ roomId: room._id });
    const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await Room.findByIdAndUpdate(room._id, {
      rating: Number(avg.toFixed(2)),
      reviewCount: allReviews.length
    });

    res.status(201).json({ message: 'Thank you for your feedback! Review published.', review });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// @route   POST /api/reviews/:id/reply
// @desc    Staff or Admin replies to a guest review (Staff/Admin only)
router.post('/:id/reply', protect, authorize('Staff', 'Admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Review ID' });
    }

    const { staffReply } = req.body;
    if (!staffReply || String(staffReply).trim().length === 0) {
      return res.status(400).json({ message: 'Staff reply text is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.staffReply = String(staffReply).trim();
    await review.save();

    res.json({ message: 'Staff reply saved successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error replying to review' });
  }
});

module.exports = router;
