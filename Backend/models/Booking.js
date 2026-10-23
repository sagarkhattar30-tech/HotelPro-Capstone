const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, default: '' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  roomName: { type: String, required: true },
  roomNumber: { type: String, default: '101' },
  roomImage: { type: String, default: '' },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  nights: { type: Number, default: 1 },
  guestsCount: { type: Number, default: 2 },
  pricePerNight: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Refunded'],
    default: 'Paid'
  },
  paymentMethod: { type: String, default: 'Credit Card' },
  transactionId: { type: String, default: '' },
  stripeSessionId: { type: String, default: '' },
  stripePaymentIntentId: { type: String, default: '' },
  specialRequests: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  refundStatus: {
    type: String,
    default: 'None'
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for high performance booking lookups and overlap checks
bookingSchema.index({ userEmail: 1, createdAt: -1 });
bookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1, status: 1 });
bookingSchema.index({ status: 1, checkInDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
