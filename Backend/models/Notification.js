const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientEmail: { type: String, default: '' },
  role: { type: String, enum: ['Guest', 'Staff', 'Admin', 'All'], default: 'Guest' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['booking', 'payment', 'service', 'checkin', 'system'],
    default: 'system'
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
