const mongoose = require('mongoose');

const seasonalPricingSchema = new mongoose.Schema({
  seasonName: { type: String, required: true },
  multiplier: { type: Number, default: 1.2 },
  startDate: { type: Date },
  endDate: { type: Date }
});

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  hotelName: { type: String, default: 'The Grand Azure Resort & Spa' },
  city: { type: String, default: 'Malibu' },
  location: { type: String, default: 'Malibu, California' },
  type: {
    type: String,
    enum: ['Deluxe', 'Executive Suite', 'Presidential Villa', 'Penthouse', 'Standard Double', 'Ocean Villa', 'Alpine Chalet', 'Heritage Suite'],
    required: true
  },
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, required: true },
  bedType: { type: String, default: 'King Size Plush' },
  sizeSqFt: { type: Number, default: 550 },
  floor: { type: Number, default: 3 },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  amenities: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Available'
  },
  seasonalPricing: [seasonalPricingSchema],
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for optimized searching and filtering
roomSchema.index({ hotelName: 1, status: 1 });
roomSchema.index({ city: 1, type: 1 });
roomSchema.index({ pricePerNight: 1, capacity: 1 });
roomSchema.index({ featured: -1, pricePerNight: 1 });

module.exports = mongoose.model('Room', roomSchema);
