const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelpro';

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    if (collections.some(c => c.name === 'bookings')) {
      const indexes = await db.collection('bookings').indexes();
      console.log('Existing bookings indexes:', indexes);
      for (const idx of indexes) {
        if (idx.name.includes('bookingCode')) {
          console.log(`Dropping stale index: ${idx.name}`);
          await db.collection('bookings').dropIndex(idx.name);
          console.log(`Dropped ${idx.name}`);
        }
      }
    }

    await mongoose.disconnect();
    console.log('Index hygiene complete.');
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
}

fixIndexes();
