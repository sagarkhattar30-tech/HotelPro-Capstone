const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get notifications for authenticated user & role (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userRole = req.user.role || 'Guest';

    // Users only receive notifications directed to their email, to their role, or to 'All'
    const query = {
      $or: [
        { recipientEmail: userEmail },
        { role: 'All' },
        { role: userRole }
      ]
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(25);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read (Protected: only own or role notification)
const markNotificationRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Notification ID' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    // Authorization check
    const isOwner = notification.recipientEmail && notification.recipientEmail.toLowerCase() === req.user.email.toLowerCase();
    const isRoleMatch = notification.role === 'All' || notification.role === req.user.role;

    if (!isOwner && !isRoleMatch && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: You cannot mark another user’s notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification status' });
  }
};

router.put('/:id/read', protect, markNotificationRead);
router.patch('/:id/read', protect, markNotificationRead);

// @route   PUT /api/notifications/mark-all
// @desc    Mark all authenticated user notifications as read (Protected)
router.put('/mark-all', protect, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userRole = req.user.role || 'Guest';

    await Notification.updateMany(
      {
        $or: [
          { recipientEmail: userEmail },
          { role: userRole },
          { role: 'All' }
        ],
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

module.exports = router;
