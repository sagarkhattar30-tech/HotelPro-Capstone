const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelpro';

async function clean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for DB hygiene check...');

    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }));
    const result = await Room.deleteMany({
      $or: [
        { name: { $exists: false } },
        { pricePerNight: { $exists: false } },
        { pricePerNight: null },
        { name: null }
      ]
    });
    console.log(`Cleaned ${result.deletedCount} invalid or stale room documents.`);

    const count = await Room.countDocuments();
    console.log(`Current valid rooms in DB: ${count}`);

    // If count is 0, let's seed standard rooms
    if (count === 0) {
      console.log('Seeding initial luxury rooms for HotelPro...');
      const seedRooms = [
        {
          roomNumber: '101',
          name: 'Deluxe Oceanfront Suite',
          type: 'Oceanfront Suite',
          pricePerNight: 350,
          capacity: 2,
          description: 'Panoramic azure ocean views, king bed, private marble bath, and sunset balcony.',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          amenities: ['Ocean View', 'King Bed', 'Balcony', 'Free WiFi', 'Mini Bar', '24/7 Room Service'],
          status: 'Available'
        },
        {
          roomNumber: '202',
          name: 'The Royal Penthouse Suite',
          type: 'Penthouse',
          pricePerNight: 850,
          capacity: 4,
          description: 'Top-floor presidential suite with private rooftop infinity plunge pool, butler service, and jacuzzi.',
          image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          amenities: ['Private Pool', 'Butler Service', 'Jacuzzi', 'Rooftop Terrace', 'Champagne Bar', 'Smart Tech'],
          status: 'Available'
        },
        {
          roomNumber: '305',
          name: 'Executive Garden Villa',
          type: 'Garden Villa',
          pricePerNight: 420,
          capacity: 3,
          description: 'Secluded tropical garden sanctuary with outdoor rain shower, sun loungers, and artisan decor.',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          amenities: ['Garden View', 'Outdoor Shower', 'Private Patio', 'Espresso Machine', 'High-Speed WiFi'],
          status: 'Available'
        },
        {
          roomNumber: '401',
          name: 'Skyline Luxury Suite',
          type: 'Skyline Suite',
          pricePerNight: 520,
          capacity: 2,
          description: 'Floor-to-ceiling glass offering awe-inspiring skyline vistas, soaking tub, and bespoke cocktail cart.',
          image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          amenities: ['Skyline View', 'Deep Soaking Tub', 'Cocktail Cart', 'Soundproof Windows', 'Ergonomic Workstation'],
          status: 'Available'
        }
      ];
      await Room.insertMany(seedRooms);
      console.log(`Seeded ${seedRooms.length} luxury rooms successfully.`);
    }

    await mongoose.disconnect();
    console.log('DB hygiene process completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during DB clean:', err);
    process.exit(1);
  }
}

clean();
