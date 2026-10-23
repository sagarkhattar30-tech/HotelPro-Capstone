const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const { protect, authorize, getJwtSecret } = require('../middleware/auth');
const seedDatabase = require('../utils/seedData');

// Helper to generate JWT token using validated secret
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// Email validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

// @route   POST /api/auth/register
// @desc    Register a new user (always created with Guest role)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SECURITY: Public registrations are ALWAYS assigned 'Guest' role.
    // Client cannot forge role to 'Staff' or 'Admin'.
    const newUser = new User({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Guest',
      phone: phone ? String(phone).trim() : '+1 (555) 019-2834',
      membershipTier: 'Silver'
    });

    await newUser.save();

    await AdminLog.create({
      action: 'Guest Registered',
      performedBy: newUser.email,
      targetEntity: newUser.role,
      details: `New Guest account created for ${newUser.name} (${newUser.email})`
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        membershipTier: newUser.membershipTier
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membershipTier: user.membershipTier
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (prevents mass-assignment of role)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = String(name).trim();
    if (phone) user.phone = String(phone).trim();
    if (avatar) user.avatar = String(avatar).trim();

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membershipTier: user.membershipTier
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// @route   POST /api/auth/seed
// @desc    Re-seed database (Authorized Admin or Controlled Development only)
router.post('/seed', async (req, res) => {
  try {
    // Only allow in development mode or if authorized Admin
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) {
      // If not dev, require admin authorization
      let token = req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
      if (!token) return res.status(403).json({ message: 'Seed endpoint disabled in production' });
      const decoded = jwt.verify(token, getJwtSecret());
      if (decoded.role !== 'Admin') {
        return res.status(403).json({ message: 'Only Administrators may trigger database reseed' });
      }
    }

    await seedDatabase();
    res.json({ message: 'Database seeded successfully with luxury rooms, demo users, bookings, and services.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed database' });
  }
});

module.exports = router;
