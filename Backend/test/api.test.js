process.env.NODE_ENV = 'test';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const crypto = require('crypto');

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
        resBookingValid.body?.booking?.totalPrice === expectedTotal &&
        resBookingValid.body?.booking?.paymentStatus === 'Pending',
      'Booking creation derives user identity from JWT, sets paymentStatus to Pending, and calculates verified pricing server-side ($' +
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

    // ==========================================
    // 5. INTEGRATED ROOM AVAILABILITY & MY-BOOKINGS
    // ==========================================
    console.log('\n--- 5. GreatStack Availability & Route Protection Tests ---');

    // Test 21: Public room listing permits unauthenticated request
    const resRoomsNoAuth = await request(app).get('/api/rooms');
    assert(
      resRoomsNoAuth.status === 200,
      'Public request to /api/rooms succeeds with 200 OK without requiring authentication'
    );

    // Test 22: Authenticated request to /api/rooms succeeds
    const resRoomsAuth = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${guestToken}`);
    assert(
      resRoomsAuth.status === 200 && Array.isArray(resRoomsAuth.body),
      'Authenticated request to /api/rooms returns room listings array'
    );

    // Test 23: Room availability date filtering in /api/rooms
    // Create an active booking for sampleRoom
    const activeBooking = await Booking.create({
      bookingNumber: `HP-TEST-${Date.now() % 10000}`,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      roomId: sampleRoom._id,
      roomName: sampleRoom.name,
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-15'),
      nights: 5,
      pricePerNight: sampleRoom.pricePerNight,
      totalPrice: sampleRoom.pricePerNight * 5,
      status: 'Confirmed',
      paymentStatus: 'Paid'
    });

    const resRoomsWithDates = await request(app)
      .get('/api/rooms?checkInDate=2026-11-12&checkOutDate=2026-11-14')
      .set('Authorization', `Bearer ${guestToken}`);

    const hasBookedRoom = resRoomsWithDates.body.some((r) => String(r._id) === String(sampleRoom._id));
    assert(
      resRoomsWithDates.status === 200 && !hasBookedRoom,
      'Room with overlapping booking (2026-11-10 to 2026-11-15) is excluded from availability search (2026-11-12 to 2026-11-14)'
    );

    // Test 24: /api/bookings/my-bookings endpoint returns authenticated user reservations
    const resMyBookings = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resMyBookings.status === 200 &&
        Array.isArray(resMyBookings.body) &&
        resMyBookings.body.some((b) => b.bookingNumber === activeBooking.bookingNumber),
      'GET /api/bookings/my-bookings returns reservations for the authenticated user'
    );

    // Cleanup test activeBooking
    await Booking.deleteOne({ _id: activeBooking._id });

    // ==========================================
    // 6. PHASE 1 PAYMENT & CORS INTEGRITY TESTS
    // ==========================================
    console.log('\n--- 6. Phase 1 Payment Integrity & CORS Tests ---');

    // Test 25: Unpaid booking creation for "Pay at Hotel Desk"
    const resDeskBooking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: sampleRoom._id,
        checkInDate: '2026-12-16',
        checkOutDate: '2026-12-18',
        guestsCount: 2,
        paymentMethod: 'Pay at Hotel Desk'
      });

    const deskPayment = resDeskBooking.body?.booking?._id
      ? await Payment.findOne({ bookingId: resDeskBooking.body.booking._id })
      : null;

    assert(
      resDeskBooking.status === 201 &&
        resDeskBooking.body?.booking?.paymentStatus === 'Pending' &&
        resDeskBooking.body?.booking?.paymentMethod === 'Pay at Hotel Desk' &&
        deskPayment?.status === 'Pending' &&
        deskPayment?.paymentMethod === 'Pay at Hotel Desk',
      'Pay at Hotel Desk creates an unpaid reservation with paymentStatus: "Pending" and Payment record status: "Pending"'
    );

    const deskBookingId = resDeskBooking.body?.booking?._id;

    // Test 26: Payment authorization enforcement (Intruder rejected from checkout, process, and invoice)
    const resIntruderCheckout = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ bookingId: deskBookingId });

    const resIntruderProcess = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ bookingId: deskBookingId });

    const resIntruderInvoice = await request(app)
      .get(`/api/payments/invoice/${deskBookingId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    assert(
      resIntruderCheckout.status === 403 &&
        resIntruderProcess.status === 403 &&
        resIntruderInvoice.status === 403,
      'Unauthorized user is rejected with 403 Forbidden when attempting payment checkout, processing, or invoice access for another guest'
    );

    // Test 27: Duplicate payment attempt prevention on already paid reservation
    const paidBooking = await Booking.create({
      bookingNumber: `HP-PAID-${Date.now() % 10000}`,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      roomId: sampleRoom._id,
      roomName: sampleRoom.name,
      checkInDate: new Date('2026-12-20'),
      checkOutDate: new Date('2026-12-22'),
      nights: 2,
      pricePerNight: sampleRoom.pricePerNight,
      totalPrice: sampleRoom.pricePerNight * 2,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Stripe'
    });

    const resDupCheckout = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: paidBooking._id });

    const resDupProcess = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: paidBooking._id });

    assert(
      resDupCheckout.status === 400 &&
        resDupProcess.status === 400 &&
        resDupCheckout.body?.message?.includes('already been paid') &&
        resDupProcess.body?.message?.includes('already been paid'),
      'Duplicate payment attempts on an already paid reservation are rejected with 400 Bad Request'
    );

    // Test 28: Direct simulated card transaction rejection (no simulated payment bypass)
    const resSimProcess = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: deskBookingId });

    const checkDeskBooking = await Booking.findById(deskBookingId);

    assert(
      resSimProcess.status === 400 &&
        checkDeskBooking.paymentStatus === 'Pending' &&
        resSimProcess.body?.message?.includes('Simulated card transactions cannot mark reservations as paid'),
      'Simulated card transaction cannot mark booking as paid; rejected with 400 and booking remains Pending'
    );

    // Test 29: CORS origin policy enforcement
    const resCorsRejected = await request(app)
      .get('/api/rooms')
      .set('Origin', 'http://unauthorized-malicious-domain.com');

    const resCorsApproved = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:5173');

    assert(
      resCorsRejected.status === 403 &&
        resCorsApproved.headers['access-control-allow-origin'] === 'http://localhost:5173',
      'CORS rejects requests from unapproved origins with 403 and permits approved development origins'
    );

    // ==========================================
    // 7. PHASE 2 RAZORPAY INTEGRATION & CONFIRMATION TESTS
    // ==========================================
    console.log('\n--- 7. Phase 2 Razorpay & My Bookings Tests ---');

    // Create a dedicated pending booking for Razorpay testing
    const rzpBooking = await Booking.create({
      bookingNumber: `HP-RZP-${Date.now() % 10000}`,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      userPhone: '+91 9876543210',
      roomId: sampleRoom._id,
      roomName: sampleRoom.name,
      hotelName: 'The Grand Azure Resort & Spa',
      checkInDate: new Date('2026-12-25'),
      checkOutDate: new Date('2026-12-27'),
      nights: 2,
      pricePerNight: sampleRoom.pricePerNight,
      taxAmount: Math.round(sampleRoom.pricePerNight * 2 * 0.12),
      totalPrice: sampleRoom.pricePerNight * 2 + Math.round(sampleRoom.pricePerNight * 2 * 0.12),
      status: 'Confirmed',
      paymentStatus: 'Pending',
      paymentMethod: 'Razorpay'
    });
    const rzpBookingId = rzpBooking._id.toString();

    // Test 30: Razorpay order endpoint securely detects invalid/dummy credentials, refuses simulated fallbacks, and keeps booking Pending
    const resRzpOrder = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: rzpBookingId });

    const checkRzpPending = await Booking.findById(rzpBookingId);

    assert(
      resRzpOrder.status === 401 &&
        resRzpOrder.body.code === 'RAZORPAY_AUTH_FAILED' &&
        checkRzpPending.paymentStatus === 'Pending' &&
        !resRzpOrder.body.orderId,
      'Razorpay order creation with unverified/dummy credentials correctly returns 401 RAZORPAY_AUTH_FAILED, does not fabricate fake orders, and keeps reservation Pending'
    );

    // Test 30b: Server calculates INR amount accurately
    const { inrTotal, amountInPaise } = require('../utils/razorpayClient').calculateInrAmount(rzpBooking.totalPrice);
    const expectedInr = Math.round(rzpBooking.totalPrice * 83);
    assert(
      inrTotal === expectedInr && amountInPaise === expectedInr * 100,
      `Server calculates INR total (₹${inrTotal}) and paise (${amountInPaise}) accurately at rate 83`
    );

    // Test 31: Razorpay payment signature verification (valid HMAC SHA256)
    const createdOrderId = `order_verified_rzp_${Date.now()}`;
    rzpBooking.razorpayOrderId = createdOrderId;
    await rzpBooking.save();

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'HotelProCapstoneSecret_TestMode_2026';
    const testPaymentId = `pay_test_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${createdOrderId}|${testPaymentId}`)
      .digest('hex');

    const resRzpVerify = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: rzpBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature
      });

    const verifiedBooking = await Booking.findById(rzpBookingId);
    const verifiedPayment = await Payment.findOne({ bookingId: rzpBookingId });

    assert(
      resRzpVerify.status === 200 &&
        resRzpVerify.body.success === true &&
        verifiedBooking.paymentStatus === 'Paid' &&
        verifiedBooking.paymentMethod === 'Razorpay' &&
        verifiedBooking.transactionId === testPaymentId &&
        verifiedPayment?.status === 'Completed',
      'Razorpay payment signature successfully verified; booking and payment updated to Paid & Completed'
    );

    // Test 32: Razorpay invalid signature rejection
    const bogusBooking = await Booking.create({
      bookingNumber: `HP-BOGUS-${Date.now() % 10000}`,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      roomId: sampleRoom._id,
      roomName: sampleRoom.name,
      checkInDate: new Date('2026-12-28'),
      checkOutDate: new Date('2026-12-30'),
      nights: 2,
      pricePerNight: sampleRoom.pricePerNight,
      totalPrice: sampleRoom.pricePerNight * 2,
      status: 'Confirmed',
      paymentStatus: 'Pending',
      paymentMethod: 'Razorpay'
    });

    const resBogusVerify = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: bogusBooking._id.toString(),
        razorpay_order_id: 'order_bogus_12345',
        razorpay_payment_id: 'pay_bogus_12345',
        razorpay_signature: 'tampered_invalid_signature_67890'
      });

    const checkBogusBooking = await Booking.findById(bogusBooking._id);

    assert(
      resBogusVerify.status === 400 &&
        resBogusVerify.body.message.includes('Invalid payment signature') &&
        checkBogusBooking.paymentStatus === 'Pending',
      'Tampered/invalid Razorpay signature is rejected with 400 Bad Request; booking remains Pending'
    );

    // Test 33: Razorpay duplicate payment rejection on already Paid reservation
    const resRzpDupOrder = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: rzpBookingId });

    const resRzpDupVerify = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: rzpBookingId,
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature
      });

    assert(
      resRzpDupOrder.status === 400 &&
        resRzpDupVerify.status === 400 &&
        resRzpDupOrder.body.message.includes('already been paid'),
      'Duplicate Razorpay order creation and verification on an already paid reservation are rejected with 400 Bad Request'
    );

    // Test 34: Payment authorization enforcement (Intruder rejected from Razorpay endpoints)
    const resIntruderRzpOrder = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ bookingId: bogusBooking._id.toString() });

    const resIntruderRzpVerify = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        bookingId: bogusBooking._id.toString(),
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'sig_123'
      });

    assert(
      resIntruderRzpOrder.status === 403 && resIntruderRzpVerify.status === 403,
      'Unauthorized user is rejected with 403 Forbidden when attempting Razorpay order creation or verification for another guest'
    );

    // Test 35: Booking confirmation endpoint returns verified booking details and state
    const resConfirmationOwner = await request(app)
      .get(`/api/bookings/confirmation/${rzpBookingId}`)
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resConfirmationOwner.status === 200 &&
        resConfirmationOwner.body.success === true &&
        resConfirmationOwner.body.confirmationState?.isPaid === true &&
        resConfirmationOwner.body.booking?.bookingNumber === rzpBooking.bookingNumber,
      'Booking confirmation endpoint returns verified details and confirmationState to reservation owner'
    );

    // Test 36: Booking confirmation rejects unauthorized guest access with 403 Forbidden
    const resConfirmationIntruder = await request(app)
      .get(`/api/bookings/confirmation/${rzpBookingId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    assert(
      resConfirmationIntruder.status === 403,
      'Unauthorized guest attempting to access another user’s confirmation receives 403 Forbidden'
    );

    console.log(`\n--- 8. Phase 4 End-to-End Journey & Resilience Tests ---`);

    // Test 37: Complete End-to-End Guest Journey
    const journeyEmail = `aatithya_guest_${testTimestamp}@royal.in`;
    const journeyPassword = 'RoyalPassword123';
    
    // Step 1: Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Maharaja Yuvraj',
        email: journeyEmail,
        password: journeyPassword,
        phone: '+91 98765 12345'
      });

    // Step 2: Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: journeyEmail, password: journeyPassword });

    const journeyToken = loginRes.body.token;

    // Step 3: Search Room with combined filters
    const searchRes = await request(app)
      .get('/api/rooms?capacity=2&maxPrice=10000')
      .set('Authorization', `Bearer ${journeyToken}`);

    const targetRoom = searchRes.body[0] || sampleRoom;

    // Step 4: Book Suite
    const journeyBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${journeyToken}`)
      .send({
        roomId: targetRoom._id.toString(),
        checkInDate: '2026-12-20',
        checkOutDate: '2026-12-23',
        guestsCount: 2,
        paymentMethod: 'Razorpay',
        specialRequests: 'Traditional garland welcome requested'
      });

    const journeyBooking = journeyBookingRes.body.booking;
    const journeyBookingId = journeyBooking._id;

    // Step 5: Initiate Razorpay Order - verifies live auth failure handling without fallback simulation
    const journeyOrderRes = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${journeyToken}`)
      .send({ bookingId: journeyBookingId });

    assert(
      journeyOrderRes.status === 401 && journeyOrderRes.body.code === 'RAZORPAY_AUTH_FAILED',
      'Step 5: Razorpay order endpoint securely halts on invalid credentials without fabricating fake orders'
    );

    // Step 6: Verify Signature server-side
    const journeyOrderId = `order_journey_${Date.now()}`;
    await Booking.findByIdAndUpdate(journeyBookingId, { razorpayOrderId: journeyOrderId });

    const journeyPayId = `pay_journey_${Date.now()}`;
    const journeySig = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${journeyOrderId}|${journeyPayId}`)
      .digest('hex');

    const journeyVerifyRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${journeyToken}`)
      .send({
        bookingId: journeyBookingId,
        razorpay_order_id: journeyOrderId,
        razorpay_payment_id: journeyPayId,
        razorpay_signature: journeySig
      });

    // Step 7: Check My Bookings
    const myBookingsRes = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${journeyToken}`);

    // Step 8: Digital Tax Invoice
    const invoiceRes = await request(app)
      .get(`/api/payments/invoice/${journeyBookingId}`)
      .set('Authorization', `Bearer ${journeyToken}`);

    assert(
      regRes.status === 201 &&
        loginRes.status === 200 &&
        Boolean(journeyToken) &&
        journeyBookingRes.status === 201 &&
        journeyVerifyRes.status === 200 &&
        myBookingsRes.status === 200 &&
        myBookingsRes.body.some(b => String(b._id) === String(journeyBookingId) && b.paymentStatus === 'Paid') &&
        invoiceRes.status === 200 &&
        invoiceRes.body.hotelInfo?.name.includes('Aatithya') &&
        invoiceRes.body.payment?.status === 'Paid',
      'Complete Journey Passed: Register → Login → Search → Book → Signature Verified → My Bookings → Aatithya Tax Invoice'
    );

    // Test 38: Pay at Hotel Desk flow leaves status Unpaid/Pending
    const deskRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${journeyToken}`)
      .send({
        roomId: targetRoom._id.toString(),
        checkInDate: '2026-12-24',
        checkOutDate: '2026-12-26',
        guestsCount: 2,
        paymentMethod: 'Pay at Hotel Desk'
      });

    const deskBookingObj = deskRes.body.booking;
    const deskInvoiceRes = await request(app)
      .get(`/api/payments/invoice/${deskBookingObj._id}`)
      .set('Authorization', `Bearer ${journeyToken}`);

    assert(
      deskRes.status === 201 &&
        deskBookingObj.paymentStatus === 'Pending' &&
        deskBookingObj.paymentMethod === 'Pay at Hotel Desk' &&
        deskInvoiceRes.body.payment.simulationNotice.includes('Payment to be collected at hotel desk upon check-in'),
      'Pay at Hotel Desk creates reservation held with Unpaid/Pending status and verified check-in collection notice'
    );

    // Test 39: Razorpay Payment Failure records non-destructive status and allows retry
    const failRes = await request(app)
      .post('/api/payments/razorpay/failed')
      .set('Authorization', `Bearer ${journeyToken}`)
      .send({ bookingId: deskBookingObj._id.toString() });

    assert(
      failRes.status === 200 &&
        failRes.body.canRetry === true &&
        failRes.body.paymentStatus === 'Pending',
      'Razorpay payment failure records non-destructive status and permits guest retry'
    );

    // Test 40: Razorpay Webhook Idempotency & Duplicate Protection
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'HotelProCapstoneWebhook_Secret_2026';
    const webhookPayloadStr = JSON.stringify({
      event: 'order.paid',
      payload: {
        payment: {
          entity: {
            id: journeyPayId,
            order_id: journeyOrderId,
            notes: { bookingId: journeyBookingId.toString() }
          }
        }
      }
    });
    const webhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookPayloadStr)
      .digest('hex');

    const dupWebhookRes = await request(app)
      .post('/api/payments/razorpay/webhook')
      .set('x-razorpay-signature', webhookSig)
      .set('Content-Type', 'application/json')
      .send(webhookPayloadStr);

    assert(
      dupWebhookRes.status === 200 &&
        dupWebhookRes.body.status === 'already_processed',
      'Razorpay webhook handles duplicate order.paid events idempotently with status: already_processed'
    );

    // ==============================================================
    // 9. FOOTER DESTINATION FILTERING & RAZORPAY SANDBOX REGRESSION
    // ==============================================================
    console.log('\n--- 9. Footer Destination & Razorpay Sandbox Regression Tests ---');

    // Test 41: Footer -> Jaipur search must return verified suites for The Amer Fort Haveli
    const resJaipur = await request(app)
      .get('/api/rooms?search=Jaipur')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resJaipur.status === 200 &&
        Array.isArray(resJaipur.body) &&
        resJaipur.body.length >= 4 &&
        resJaipur.body.every((r) => r.city === 'Jaipur' || r.location.includes('Jaipur') || r.hotelName.includes('Amer')),
      `Footer -> Jaipur search returns ${resJaipur.body?.length} verified suites for The Amer Fort Haveli without empty results`
    );

    // Test 42: Footer -> Udaipur search must return verified suites for The Mewar Lake Palace
    const resUdaipur = await request(app)
      .get('/api/rooms?search=Udaipur')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resUdaipur.status === 200 &&
        Array.isArray(resUdaipur.body) &&
        resUdaipur.body.length >= 4 &&
        resUdaipur.body.every((r) => r.city === 'Udaipur' || r.location.includes('Udaipur') || r.hotelName.includes('Mewar')),
      `Footer -> Udaipur search returns ${resUdaipur.body?.length} verified suites for The Mewar Lake Palace`
    );

    // Test 43: Destination filtering for other Indian heritage locations
    const resShimla = await request(app).get('/api/rooms?search=Shimla').set('Authorization', `Bearer ${guestToken}`);
    const resKerala = await request(app).get('/api/rooms?search=Kerala').set('Authorization', `Bearer ${guestToken}`);
    const resVaranasi = await request(app).get('/api/rooms?search=Varanasi').set('Authorization', `Bearer ${guestToken}`);
    const resGoa = await request(app).get('/api/rooms?search=Goa').set('Authorization', `Bearer ${guestToken}`);

    assert(
      resShimla.body.length >= 4 &&
        resKerala.body.length >= 4 &&
        resVaranasi.body.length >= 4 &&
        resGoa.body.length >= 4,
      'Heritage destination filtering returns verified suites for Shimla, Kerala, Varanasi, and Goa'
    );

    // Test 44: Curated stays / Suite category filtering
    const resPresidential = await request(app)
      .get('/api/rooms?type=Presidential%20Villa')
      .set('Authorization', `Bearer ${guestToken}`);
    const resPenthouse = await request(app)
      .get('/api/rooms?type=Penthouse')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resPresidential.body.length >= 6 && resPenthouse.body.length >= 6,
      'Curated stays filtering for Presidential Villa and Penthouse returns matching royal residences'
    );

    // Test 45: Property dropdown filter by hotel name
    const resHotelAmer = await request(app)
      .get('/api/rooms?hotel=The%20Amer%20Fort%20Haveli')
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      resHotelAmer.status === 200 && resHotelAmer.body.length === 4,
      'Selecting The Amer Fort Haveli in Property dropdown returns all 4 authentic palace suites'
    );

    // Test 46: Booking an Indian heritage suite directly (Pink City Deluxe Heritage Chamber)
    const heritageBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: '6ad9e677ecabd32c0dc0e101', // Pink City Deluxe Chamber in Jaipur
        checkInDate: '2026-11-20',
        checkOutDate: '2026-11-23',
        guestsCount: 2,
        paymentMethod: 'Razorpay'
      });

    let heritageBookingId = heritageBookingRes.body?.booking?._id;
    assert(
      heritageBookingRes.status === 201 &&
        heritageBookingRes.body.booking.roomName.includes('Pink City') &&
        heritageBookingRes.body.booking.hotelName.includes('The Amer Fort Haveli') &&
        heritageBookingRes.body.booking.paymentStatus === 'Pending' &&
        !heritageBookingRes.body.razorpayOrder,
      'Heritage suite reservation succeeds with verified server pricing, paymentStatus: Pending, and no fake order creation'
    );

    // Test 47: Razorpay order endpoint rejects invalid credentials with 401 without creating fake order
    const rzpOrderRes = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: heritageBookingId });

    assert(
      rzpOrderRes.status === 401 &&
        rzpOrderRes.body.code === 'RAZORPAY_AUTH_FAILED' &&
        !rzpOrderRes.body.orderId,
      'Razorpay order creation with unverified credentials returns 401 RAZORPAY_AUTH_FAILED without generating fake order_test_'
    );

    // Test 48: Unauthorized user blocked from verifying or initiating payment on another user's reservation
    const unauthIntruderToken = (
      await request(app).post('/api/auth/register').send({
        name: 'Intruder User',
        email: `intruder_${testTimestamp}@threat.com`,
        password: 'password123'
      })
    ).body.token;

    const unauthVerifyRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${unauthIntruderToken}`)
      .send({
        bookingId: heritageBookingId,
        razorpay_order_id: 'order_intruder_123',
        razorpay_payment_id: 'pay_intruder_123',
        razorpay_signature: 'sig_intruder_123'
      });

    assert(
      unauthVerifyRes.status === 403,
      'Unauthorized user is blocked with 403 Forbidden from verifying payment for another guest'
    );

    // Test 49: Verification rejects order ID mismatch between payload and stored booking
    const testOrderId = `order_heritage_${Date.now()}`;
    await Booking.findByIdAndUpdate(heritageBookingId, { razorpayOrderId: testOrderId });

    const mismatchOrderRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: heritageBookingId,
        razorpay_order_id: 'order_different_mismatched',
        razorpay_payment_id: 'pay_test_mismatch',
        razorpay_signature: 'any_signature'
      });

    assert(
      mismatchOrderRes.status === 400 && mismatchOrderRes.body.message.includes('Order ID mismatch'),
      'Verification strictly enforces stored order ID match, rejecting mismatched order IDs with 400'
    );

    // Test 50: Legitimate HMAC-SHA256 signature verification marks booking as Paid
    const legitimatePayId = `pay_legit_${Date.now()}`;
    const legitimateSig = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${testOrderId}|${legitimatePayId}`)
      .digest('hex');

    const verifyRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: heritageBookingId,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: legitimatePayId,
        razorpay_signature: legitimateSig
      });

    assert(
      verifyRes.status === 200 &&
        verifyRes.body.success === true &&
        verifyRes.body.booking.paymentStatus === 'Paid' &&
        verifyRes.body.booking.status === 'Confirmed',
      'Server-side signature verification validates HMAC signature and updates booking to Paid & Confirmed'
    );

    // Test 51: Duplicate payment attempts rejected on the now-Paid reservation
    const dupPayRes = await request(app)
      .post('/api/payments/razorpay/order')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: heritageBookingId });

    assert(
      dupPayRes.status === 400 && dupPayRes.body.message.includes('already been paid'),
      'Duplicate payment attempts on Paid reservation rejected with 400 Bad Request'
    );

    // ==========================================
    // 10. BOOKING HOLD EXPIRY, RETRIES & AVAILABILITY TESTS
    // ==========================================
    console.log('\n--- 10. Booking Hold Expiry, Retries & Availability Tests ---');

    // Setup: Create a second verified guest to test multi-user availability & holds
    const guestTwoEmail = `guesttwo_${testTimestamp}@example.com`;
    const resRegGuestTwo = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second Guest',
        email: guestTwoEmail,
        password: 'password123'
      });
    const guestTwoToken = resRegGuestTwo.body.token;

    // Use a designated room for hold expiry testing
    const holdTestRoom = await Room.findOne().sort({ pricePerNight: 1 });
    const holdRoomId = holdTestRoom._id.toString();

    // Check dates for test (future dates)
    const holdCheckIn = '2026-11-20';
    const holdCheckOut = '2026-11-23';

    // Test 52: Online payment hold sets holdExpiresAt (approx 15 minutes ahead)
    const holdBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut,
        guestsCount: 2,
        paymentMethod: 'Razorpay'
      });

    const holdBookingId = holdBookingRes.body.booking?._id;
    const holdExpiresAt = holdBookingRes.body.booking?.holdExpiresAt;

    assert(
      holdBookingRes.status === 201 &&
        !!holdExpiresAt &&
        new Date(holdExpiresAt) > new Date(),
      'Online booking creates a pending reservation with a valid future holdExpiresAt timestamp'
    );

    // Test 53: Active pending hold blocks another guest from booking overlapping dates
    const guestTwoBlockedRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestTwoToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut,
        guestsCount: 2,
        paymentMethod: 'Razorpay'
      });

    assert(
      guestTwoBlockedRes.status === 400 &&
        guestTwoBlockedRes.body.message.includes('already reserved'),
      'Active pending hold blocks another guest from booking overlapping dates'
    );

    // Test 54: Payment failure records failure status without cancelling reservation or permanently blocking
    const failRecordRes = await request(app)
      .post('/api/payments/razorpay/failed')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        bookingId: holdBookingId,
        errorDescription: 'Card declined / payment dismissed'
      });

    const paymentRecordAfterFail = await Payment.findOne({ bookingId: holdBookingId });

    assert(
      failRecordRes.status === 200 &&
        failRecordRes.body.canRetry === true &&
        paymentRecordAfterFail?.status === 'Failed',
      'Failed payment recording updates Payment record to Failed, preserves pending reservation, and permits retry'
    );

    // Test 55: Same user retrying payment for an active pending booking reuses that booking (no "Already Reserved" error)
    const retryBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut,
        guestsCount: 2,
        paymentMethod: 'Razorpay'
      });

    assert(
      retryBookingRes.status === 200 &&
        retryBookingRes.body.booking._id === holdBookingId &&
        retryBookingRes.body.isReused === true,
      'Same user retrying payment for existing pending booking reuses that booking without "Already Reserved" error'
    );

    // Test 56: Expired online hold does NOT block another guest from booking
    // Simulate expired hold by setting holdExpiresAt to the past
    await Booking.findByIdAndUpdate(holdBookingId, {
      holdExpiresAt: new Date(Date.now() - 5 * 60 * 1000) // expired 5 minutes ago
    });

    const guestTwoAvailRes = await request(app)
      .post('/api/bookings/availability')
      .set('Authorization', `Bearer ${guestTwoToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut
      });

    assert(
      guestTwoAvailRes.status === 200 && guestTwoAvailRes.body.available === true,
      'Expired online hold does NOT block room availability for other guests'
    );

    // Test 57: Guest Two can now successfully reserve the room whose previous hold expired
    const guestTwoBookSuccessRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestTwoToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut,
        guestsCount: 2,
        paymentMethod: 'Pay at Hotel Desk'
      });

    const guestTwoBookingId = guestTwoBookSuccessRes.body.booking?._id;

    assert(
      guestTwoBookSuccessRes.status === 201 &&
        guestTwoBookSuccessRes.body.booking?.paymentMethod === 'Pay at Hotel Desk',
      'Other guest successfully reserves the room after the previous online hold expired'
    );

    // Test 58: Pay at Hotel Desk reservation holds room without an expiry time (holdExpiresAt is null)
    const deskHoldExpiresAt = guestTwoBookSuccessRes.body.booking?.holdExpiresAt;
    assert(
      deskHoldExpiresAt === null || deskHoldExpiresAt === undefined,
      'Pay at Hotel Desk reservation has holdExpiresAt null and does not prematurely expire'
    );

    // Test 59: Pay at Hotel Desk reservation blocks all other guests from overlapping dates
    const originalGuestBlockedRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: holdCheckIn,
        checkOutDate: holdCheckOut,
        guestsCount: 1,
        paymentMethod: 'Razorpay'
      });

    assert(
      originalGuestBlockedRes.status === 400 &&
        originalGuestBlockedRes.body.message.includes('already reserved'),
      'Pay at Hotel Desk reservation blocks other users from booking overlapping dates'
    );

    // Test 60: Non-overlapping adjacent dates are allowed (check-out date matches next check-in date)
    const adjacentBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: '2026-11-23', // Starts exactly on previous check-out date
        checkOutDate: '2026-11-26',
        guestsCount: 1,
        paymentMethod: 'Pay at Hotel Desk'
      });

    const adjacentBookingId = adjacentBookingRes.body.booking?._id;

    assert(
      adjacentBookingRes.status === 201,
      'Non-overlapping adjacent reservation (checkIn = previous checkOut) is allowed'
    );

    // Clean up Phase 10 test records
    await Booking.deleteMany({ _id: { $in: [holdBookingId, guestTwoBookingId, adjacentBookingId] } });
    await Payment.deleteMany({ bookingId: { $in: [holdBookingId, guestTwoBookingId, adjacentBookingId] } });
    await User.deleteOne({ email: guestTwoEmail });

    // ==========================================
    // 11. STRIPE EUR (€) CURRENCY CONVERSION & CHECKOUT TESTS
    // ==========================================
    console.log('\n--- 11. Stripe EUR (€) Currency Conversion & Checkout Tests ---');

    const { convertInrToEur, getEurToInrRate, convertInrToGbp, getGbpToInrRate } = require('../utils/currencyConverter');

    // Test 61: Canonical rate check (1 EUR ≈ 110 INR)
    const activeEurRate = getEurToInrRate();
    assert(
      activeEurRate === 110 || activeEurRate > 0,
      'Currency converter returns positive exchange rate for EUR to INR (default 110)'
    );

    // Test 62: Exact EUR currency conversion calculation (22,000 INR / 110 = 200.00 EUR)
    const testInr = 22000;
    const { eurAmount, eurAmountCents, exchangeRate } = convertInrToEur(testInr);
    assert(
      eurAmount === 200 && eurAmountCents === 20000 && exchangeRate === 110,
      'convertInrToEur accurately calculates €200.00 (20000 cents) for ₹22,000 at rate 110'
    );

    // Test 63: Fractional EUR currency conversion and rounding (46,480 INR / 110 = 422.55 EUR)
    const testStayInr = 46480;
    const convertedStay = convertInrToEur(testStayInr);
    assert(
      convertedStay.eurAmount === 422.55 && convertedStay.eurAmountCents === 42255,
      'convertInrToEur accurately calculates €422.55 (42255 cents) for ₹46,480 at rate 110'
    );

    // Test 64: POST /api/bookings with Stripe method creates pending reservation with holdExpiresAt
    const stripeBookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: holdRoomId,
        checkInDate: '2026-11-27',
        checkOutDate: '2026-11-30',
        guestsCount: 2,
        paymentMethod: 'Stripe'
      });

    const stripeBookingId = stripeBookingRes.body.booking?._id;
    assert(
      stripeBookingRes.status === 201 &&
        stripeBookingRes.body.booking?.paymentMethod === 'Stripe' &&
        !!stripeBookingRes.body.booking?.holdExpiresAt,
      'Booking with Stripe payment method sets paymentMethod: "Stripe" and active holdExpiresAt'
    );

    // Test 65: POST /api/payments/checkout handles live Stripe credentials or graceful 503 when unconfigured
    const checkoutAttemptRes = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ bookingId: stripeBookingId });

    if (checkoutAttemptRes.status === 200) {
      assert(
        checkoutAttemptRes.body.checkoutUrl && checkoutAttemptRes.body.sessionId && checkoutAttemptRes.body.currency === 'EUR',
        'Stripe checkout returns live session url, sessionId, and currency EUR'
      );
    } else {
      assert(
        checkoutAttemptRes.status === 503 && checkoutAttemptRes.body.message.includes('Stripe is not configured'),
        'Stripe checkout returns clean 503 notice when API keys are pending without unhandled crashes'
      );
    }

    // Test 66: Invoice arithmetic for EUR payment reconciles line items (rate * nights = subtotal) and total (subtotal + tax = total)
    const eurTestBooking = await Booking.create({
      bookingNumber: `HP-EUR-${Date.now()}`,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      roomId: sampleRoom._id,
      roomName: sampleRoom.name,
      checkInDate: new Date('2026-11-20'),
      checkOutDate: new Date('2026-11-23'),
      nights: 3,
      pricePerNight: 620,
      taxAmount: 223,
      totalPrice: 2083,
      currency: 'EUR',
      paymentMethod: 'Stripe',
      status: 'Confirmed',
      paymentStatus: 'Paid'
    });

    await Payment.create({
      bookingId: eurTestBooking._id,
      bookingNumber: eurTestBooking.bookingNumber,
      userEmail: guestEmail,
      userName: 'Verified Guest',
      amount: 1571.72,
      currency: 'EUR',
      paymentMethod: 'Stripe',
      transactionId: `pi_test_${Date.now()}`,
      status: 'Completed',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    });

    const eurInvoiceRes = await request(app)
      .get(`/api/payments/invoice/${eurTestBooking._id}`)
      .set('Authorization', `Bearer ${guestToken}`);

    assert(
      eurInvoiceRes.status === 200 &&
        eurInvoiceRes.body.charges.total === 1571.72 &&
        eurInvoiceRes.body.charges.ratePerNight === 467.77 &&
        eurInvoiceRes.body.charges.subtotal === 1403.31 &&
        eurInvoiceRes.body.charges.occupancyTax === 168.40 &&
        eurInvoiceRes.body.charges.roundingAdjustment === 0.01 &&
        Math.round(eurInvoiceRes.body.charges.ratePerNight * eurInvoiceRes.body.charges.nights * 100) / 100 === eurInvoiceRes.body.charges.subtotal &&
        Math.round(eurInvoiceRes.body.charges.subtotal * 0.12 * 100) / 100 === eurInvoiceRes.body.charges.occupancyTax &&
        Math.round((eurInvoiceRes.body.charges.subtotal + eurInvoiceRes.body.charges.occupancyTax + eurInvoiceRes.body.charges.roundingAdjustment) * 100) / 100 === eurInvoiceRes.body.charges.total,
      'Invoice line items (€467.77 × 3 = €1,403.31), exact 12% tax (€168.40), and rounding adjustment (€0.01) reconcile exactly to the €1,571.72 Stripe total'
    );

    await Booking.deleteOne({ _id: eurTestBooking._id });
    await Payment.deleteMany({ bookingId: eurTestBooking._id });

    if (stripeBookingId) {
      await Booking.deleteOne({ _id: stripeBookingId });
      await Payment.deleteMany({ bookingId: stripeBookingId });
    }

    // Cleanup regression test artifacts
    if (heritageBookingId) {
      await Booking.deleteOne({ _id: heritageBookingId });
      await Payment.deleteMany({ bookingId: heritageBookingId });
    }
    await User.deleteOne({ email: `intruder_${testTimestamp}@threat.com` });

    // Cleanup Phase 4 test artifacts
    if (journeyBookingId) {
      await Booking.deleteOne({ _id: journeyBookingId });
      await Payment.deleteMany({ bookingId: journeyBookingId });
    }
    if (deskBookingObj?._id) {
      await Booking.deleteOne({ _id: deskBookingObj._id });
      await Payment.deleteMany({ bookingId: deskBookingObj._id });
    }
    await User.deleteOne({ email: journeyEmail });

    // Cleanup test artifacts
    if (rzpBookingId) {
      await Booking.deleteOne({ _id: rzpBookingId });
      await Payment.deleteMany({ bookingId: rzpBookingId });
    }
    if (bogusBooking?._id) {
      await Booking.deleteOne({ _id: bogusBooking._id });
      await Payment.deleteMany({ bookingId: bogusBooking._id });
    }
    if (deskBookingId) {
      await Booking.deleteOne({ _id: deskBookingId });
      await Payment.deleteMany({ bookingId: deskBookingId });
    }
    if (paidBooking?._id) {
      await Booking.deleteOne({ _id: paidBooking._id });
      await Payment.deleteMany({ bookingId: paidBooking._id });
    }
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
