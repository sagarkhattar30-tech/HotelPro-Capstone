require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const seedDatabase = require('./utils/seedData');
const { handleStripeWebhook } = require('./controllers/stripeWebhook');
const Room = require('./models/Room');
const Hotel = require('./models/Hotel');

const app = express();

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Stripe webhooks require the raw body for signature verification (before JSON parser)
app.post('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.post('/api/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Payload limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotelpro';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected to HotelPro Database');
    try {
      const hotelCount = await Hotel.countDocuments();
      const roomCount = await Room.countDocuments();
      if (hotelCount < 4 || roomCount < 8) {
        console.log('⚡ Initializing database with full luxury hotels, residences and demo data...');
        await seedDatabase();
      }
    } catch (e) {
      console.warn('Auto-seed check notice:', e.message);
    }
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'HotelPro Hospitality Management API',
    version: '2.5.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: {
      auth: '/api/auth',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      payments: '/api/payments',
      stripeWebhook: '/api/payments/stripe-webhook',
      staff: '/api/staff',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      admin: '/api/admin'
    }
  });
});

// Centralized API 404 handler (compatible with Express 5 path-to-regexp)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: `API endpoint ${req.originalUrl} not found` });
  }
  next();
});

// Global Centralized Error Handler (Prevents stack trace leaks in production)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.error('API Error:', err.message, err.stack);
  } else {
    console.error('API Error:', err.message);
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🏨 HotelPro Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;