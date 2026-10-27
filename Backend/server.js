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
const sanitizeMongoUri = (raw) => {
  const fallback = 'mongodb+srv://sagarkhattar30_db_user:Sagar%4016@cluster0.e9g9ft7.mongodb.net/hotelpro?retryWrites=true&w=majority';
  if (!raw) return fallback;
  let uri = String(raw).trim().replace(/[\r\n"']/g, '');
  if (uri.startsWith('MONGO_URI=')) {
    uri = uri.replace(/^MONGO_URI=\s*/, '');
  }
  // Check if someone passed localhost in cloud/Vercel
  if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
    return fallback;
  }
  // Automatically fix unencoded @ in password
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+?)@([^@]+)$/);
  if (match) {
    const [, protocol, user, pass, hostAndQuery] = match;
    const encodedPass = encodeURIComponent(decodeURIComponent(pass));
    return `${protocol}${user}:${encodedPass}@${hostAndQuery}`;
  }
  return uri || fallback;
};

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const rawUri = sanitizeMongoUri(process.env.MONGO_URI);
    cached.promise = mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10
    }).then(async (m) => {
      console.log('✅ MongoDB Connected to HotelPro Database');
      lastDbError = null;
      return m;
    }).catch(err => {
      cached.promise = null;
      lastDbError = err.message;
      console.error('❌ Database connection error:', err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Initial connect
connectDB().catch(e => console.warn('Initial connect async notice:', e.message));

// Middleware to ensure DB connection is ready on every serverless invocation
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/stripe')) {
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect middleware notice:', e.message);
    }
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