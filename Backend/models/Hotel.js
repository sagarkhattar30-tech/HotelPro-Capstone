const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  location: { type: String, required: true }, // e.g. "Malibu, California"
  address: { type: String, required: true },
  starRating: { type: Number, default: 5 },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 120 },
  image: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  amenities: [{ type: String }],
  startingPrice: { type: Number, default: 250 },
  phone: { type: String, default: '+1 (800) 555-AZURE' },
  email: { type: String, default: 'reservations@hotelpro.com' },
  featured: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
