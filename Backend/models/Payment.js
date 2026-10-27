const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  bookingNumber: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Credit Card (Simulated)', 'Stripe', 'Stripe / UPI', 'Razorpay', 'Pay at Hotel Desk'],
    default: 'Credit Card'
  },
  transactionId: { type: String, required: true },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  invoiceNumber: { type: String, required: true },
  cardLast4: { type: String, default: '4242' },
  failureReason: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now }
});

// Indexes for high performance payment auditing and lookup
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userEmail: 1, paidAt: -1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
