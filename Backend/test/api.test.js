process.env.NODE_ENV = 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

async function runTests() {
  console.log('🧪 Starting HotelPro Automated Security & API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Ensure DB connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    const testTimestamp = Date.now();
    const guestEmail = `testguest_${testTimestamp}@example.com`;
    const forgedAdminEmail = `forgedadmin_${testTimestamp}@example.com`;
    let guestToken = '';
    let adminToken = '';
    let testRoomId = '';
    let testBookingId = '';

    // ==========================================
    // 1. AUTHENTICATION & ROLE ESCALATION TESTS
    // ==========================================
    console.log('\n--- 1. Authentication & Security Gate Tests ---');

    // Test 1: Forged role registration must be blocked and forced to Guest
    const resRegForged = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker Malicious',
        email: forgedAdminEmail,
        password: 'password123',
        role: 'Admin' // Attacker payload attempting to gain Admin privileges
      });

    assert(
      resRegForged.status === 201 && resRegForged.body.user.role === 'Guest',
      'Public registration forcibly assigns role "Guest" even when request payload specifies role: "Admin"'
    );

    // Test 2: Standard guest registration
    const resRegGuest = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Verified Guest',
        email: guestEmail,
        password: 'password123'
      });

    assert(
      resRegGuest.status === 201 && !!resRegGuest.body.token,
      'Legitimate registration returns 201 and valid JWT token'
    );
    guestToken = resRegGuest.body.token;

    // Test 3: Duplicate email rejection
    const resRegDuplicate = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Person',
        email: guestEmail, // duplicate
        password: 'password123'
      });

    assert(
      resRegDuplicate.status === 400 && resRegDuplicate.body.message.includes('already exists'),
      'Duplicate email registration is rejected with 400 Bad Request'
    );

    // Test 4: Short password rejection
    const resRegShortPass = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: `shortpass_${testTimestamp}@example.com`,
        password: '123'
      });

    assert(
      resRegShortPass.status === 400,
      'Passwords under 6 characters are rejected with 400 Bad Request'
    );

    // Test 5: Successful login
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: guestEmail,
        password: 'password123'
      });

    assert(
      resLogin.status === 200 && resLogin.body.user.email === guestEmail,
      'Valid credentials authenticate successfully and return sanitized user profile'
    );

    // Test 6: Invalid password rejection
    const resLoginBadPass = await request(app)
      .post('/api/auth/login')
      .send({
        email: guestEmail,
        password: 'wrongpassword'
      });

    assert(
      resLoginBadPass.status === 401,
      'Incorrect password returns 401 Unauthorized'
    );

    // Test 7: Profile access with token
    const resMe = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resMe.status === 200 && resMe.body.email === guestEmail,
      'Authenticated /api/auth/me returns current user identity'
    );

    // Test 8: Unauthenticated access rejection
    const resMeNoToken = await request(app).get('/api/auth/me');
    assert(
      resMeNoToken.status === 401,
      'Unauthenticated request to protected route returns 401 Unauthorized'
    );

    // Setup Admin account for admin authorization tests
    let adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Test Administrator',
        email: `admin_${testTimestamp}@hotelpro.com`,
        password: 'hashedpassword',
        role: 'Admin'
      });
    }
    const jwt = require('jsonwebtoken');
    const { getJwtSecret } = require('../middleware/auth');
    adminToken = jwt.sign(
      { id: adminUser._id, role: 'Admin', email: adminUser.email, name: adminUser.name },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    // ==========================================
    // 2. ROLE-BASED AUTHORIZATION TESTS
    // ==========================================
    console.log('\n--- 2. Role-Based Access Control (RBAC) Tests ---');

    // Test 9: Guest cannot access Admin Analytics
    const resGuestAdmin = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resGuestAdmin.status === 403,
      'Guest account attempting to access /api/admin/analytics receives 403 Forbidden'
    );

    // Test 10: Guest cannot access Admin User list
    const resGuestUsers = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resGuestUsers.status === 403,
      'Guest account attempting to access /api/admin/users receives 403 Forbidden'
    );

    // Test 11: Guest cannot access Staff operations
    const resGuestStaff = await request(app)
      .get('/api/staff/stats')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resGuestStaff.status === 403,
      'Guest account attempting to access /api/staff/stats receives 403 Forbidden'
    );

    // Test 12: Admin can access Admin Analytics
    const resAdminAnalytics = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(
      resAdminAnalytics.status === 200 && !!resAdminAnalytics.body.metrics,
      'Admin account successfully accesses /api/admin/analytics with metrics payload'
    );

    // ==========================================
    // 3. BOOKING BUSINESS LOGIC & AVAILABILITY
    // ==========================================
    console.log('\n--- 3. Booking Business Logic & Security Tests ---');

    // Create dedicated isolated room for test execution to guarantee clean availability
    const sampleRoom = await Room.create({
      roomNumber: `TST-${testTimestamp % 100000}`,
      name: `Automated Test Penthouse ${testTimestamp}`,
      type: 'Penthouse',
      pricePerNight: 500,
      capacity: 4,
      description: 'Test luxury room suite for automated CI/CD verification',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'
    });
    testRoomId = sampleRoom._id.toString();

    // Test 13: Unauthenticated booking creation rejected
    const resBookNoAuth = await request(app)
      .post('/api/bookings')
      .send({
        roomId: testRoomId,
        checkInDate: '2026-12-01',
        checkOutDate: '2026-12-04'
      });

    assert(
      resBookNoAuth.status === 401,
      'Unauthenticated booking creation is rejected with 401 Unauthorized'
    );

    // Test 14: Valid authenticated booking with server-side price enforcement
    const resBookingValid = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoomId,
        checkInDate: '2026-12-10',
        checkOutDate: '2026-12-13', // 3 nights
        guestsCount: 2,
        pricePerNight: 1 // Malicious low rate supplied by client
      });

    const expectedNights = 3;
    const expectedBase = expectedNights * sampleRoom.pricePerNight;
    const expectedTax = Math.round(expectedBase * 0.12);
    const expectedTotal = expectedBase + expectedTax;

    assert(
      resBookingValid.status === 201 &&
        resBookingValid.body?.booking?.userEmail === guestEmail &&
        resBookingValid.body?.booking?.pricePerNight === sampleRoom.pricePerNight &&
        resBookingValid.body?.booking?.totalPrice === expectedTotal,
      'Booking creation derives user identity from JWT and calculates verified pricing server-side ($' +
        expectedTotal +
        '), ignoring client-supplied rate'
    );
    testBookingId = resBookingValid.body?.booking?._id;

    // Test 15: Overlapping booking prevention for same room and dates
    const resBookingOverlap = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoomId,
        checkInDate: '2026-12-11', // Overlaps with 2026-12-10 -> 2026-12-13
        checkOutDate: '2026-12-15',
        guestsCount: 2
      });

    assert(
      resBookingOverlap.status === 400 && resBookingOverlap.body.message.includes('already reserved'),
      'Overlapping reservation for the same room is blocked with 400 Bad Request'
    );

    // Test 16: Object-level authorization for booking details
    const intruderUser = await User.create({
      name: 'Intruder User',
      email: `intruder_${testTimestamp}@other.com`,
      password: 'password123',
      role: 'Guest'
    });
    const otherUserToken = jwt.sign(
      { id: intruderUser._id, role: 'Guest', email: intruderUser.email, name: intruderUser.name },
      getJwtSecret()
    );

    const resIntruderView = await request(app)
      .get(`/api/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    assert(
      resIntruderView.status === 403,
      'User attempting to access another guest’s booking receives 403 Forbidden'
    );

    // Test 17: User attempting to cancel another guest’s booking
    const resIntruderCancel = await request(app)
      .post(`/api/bookings/${testBookingId}/cancel`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ reason: 'Intruder cancellation' });

    assert(
      resIntruderCancel.status === 403,
      'User attempting to cancel another guest’s reservation receives 403 Forbidden'
    );

    // Test 18: Legitimate cancellation by booking owner
    const resOwnerCancel = await request(app)
      .post(`/api/bookings/${testBookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ reason: 'Change of travel plans' });

    assert(
      resOwnerCancel.status === 200 && resOwnerCancel.body.booking.status === 'Cancelled',
      'Booking owner can cancel their reservation; status updates to Cancelled'
    );

    // ==========================================
    // 4. NOTIFICATION & REVIEWS SECURITY
    // ==========================================
    console.log('\n--- 4. Notification & Review Security Tests ---');

    // Test 19: Notifications isolated to authenticated user
    const resNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resNotifications.status === 200 && Array.isArray(resNotifications.body),
      'Protected notifications endpoint returns array isolated to recipient'
    );

    // Test 20: Authenticated review submission with rating validation
    const resReview = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoomId,
        rating: 5,
        comment: 'Outstanding stay and impeccable private concierge service!'
      });

    assert(
      resReview.status === 201 && resReview.body.review.rating === 5,
      'Authenticated review submission succeeds and records verified rating'
    );

    // Cleanup test artifacts
    if (sampleRoom?._id) {
      await Room.deleteOne({ _id: sampleRoom._id });
      await Booking.deleteMany({ roomId: sampleRoom._id });
    }
    await User.deleteMany({ email: { $in: [guestEmail, forgedAdminEmail, `intruder_${testTimestamp}@other.com`] } });

    console.log(`\n==============================================`);
    console.log(`TEST SUITE RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`==============================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test Suite Exception:', err);
    process.exit(1);
  }
}

runTests();
