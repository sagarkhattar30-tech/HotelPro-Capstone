const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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
const supportRoutes = require('./routes/supportRoutes');
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

// CORS Configuration - Strictly allow configured origins and approved local development origins
const approvedDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5000'
];

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...approvedDevOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app')) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      const corsError = new Error(`Origin ${origin} is not allowed by CORS policy.`);
      corsError.status = 403;
      return callback(corsError);
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

// Database Connection handling with serverless connection pooling & resilience
let lastDbError = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const rawUri = (process.env.MONGO_URI || 'mongodb://localhost:27017/hotelpro').trim().replace(/[\r\n]+/g, '');
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 6000
    });
    console.log('✅ MongoDB Connected to HotelPro Database');
    lastDbError = null;
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
  } catch (err) {
    lastDbError = err.message;
    console.error('❌ Database connection error:', err.message);
  }
};

// Initial connect
connectDB();

// Middleware to ensure DB connection is ready on every serverless invocation
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !req.path.startsWith('/api/stripe')) {
    await connectDB();
  }
  next();
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
app.use('/api/support', supportRoutes);

// Root route with diagnostics
app.get('/', (req, res) => {
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'online',
    system: 'HotelPro Hospitality Management API',
    version: '2.5.0',
    database: {
      status: stateNames[mongoose.connection.readyState] || 'unknown',
      connected: mongoose.connection.readyState === 1,
      error: lastDbError
    },
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
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🏨 HotelPro Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;