const mongoose = require('mongoose');

const checkInOutSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  bookingNumber: { type: String, required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  roomNumber: { type: String, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  keyCardCode: { type: String, default: '' },
  staffName: { type: String, default: 'Duty Concierge' },
  inspectionNotes: { type: String, default: 'Room in pristine condition. No damages.' },
  extraCharges: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CheckInOut', checkInOutSchema);
