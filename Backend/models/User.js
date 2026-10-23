const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Guest', 'Staff', 'Admin'], default: 'Guest' },
  phone: { type: String, default: '+1 (555) 019-2834' },
  avatar: { type: String, default: '' },
  membershipTier: { type: String, enum: ['Silver', 'Gold Elite', 'Platinum VIP'], default: 'Gold Elite' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
