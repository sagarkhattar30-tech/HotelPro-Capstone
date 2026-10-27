const Booking = require('../models/Booking');

const ACTIVE_BOOKING_STATUSES = ['Confirmed', 'Checked-In'];

/**
 * Returns configurable hold expiry duration in minutes (default: 15 minutes).
 */
const getHoldExpiryMinutes = () => {
  const mins = parseInt(process.env.BOOKING_HOLD_EXPIRY_MINUTES || '15', 10);
  return isNaN(mins) || mins <= 0 ? 15 : mins;
};

/**
 * Computes future Date timestamp when an unpaid online booking hold expires.
 */
const calculateHoldExpiresAt = () => {
  return new Date(Date.now() + getHoldExpiryMinutes() * 60 * 1000);
};

/**
 * Returns a MongoDB query filter condition matching reservations that actively block room availability.
 * A booking blocks dates ONLY IF:
 * 1. Its status is Confirmed or Checked-In (never Cancelled or Checked-Out).
 * 2. AND EITHER:
 *    a) It has paymentStatus 'Paid'
 *    b) OR it is a 'Pay at Hotel Desk' reservation (not marked Failed)
 *    c) OR it is an unexpired online pending hold (holdExpiresAt > now)
 *    d) OR (legacy fallback) it has paymentStatus 'Pending' without holdExpiresAt created within the hold window.
 *
 * Cancelled, failed, or expired online reservations NEVER block room dates.
 */
const getActiveBookingFilter = () => {
  const now = new Date();
  const legacyCutoff = new Date(now.getTime() - getHoldExpiryMinutes() * 60 * 1000);

  return {
    status: { $in: ACTIVE_BOOKING_STATUSES },
    $or: [
      { paymentStatus: 'Paid' },
      { paymentMethod: 'Pay at Hotel Desk', paymentStatus: { $ne: 'Failed' } },
      {
        paymentStatus: 'Pending',
        holdExpiresAt: { $gt: now }
      },
      {
        paymentStatus: 'Pending',
        holdExpiresAt: { $exists: false },
        createdAt: { $gt: legacyCutoff }
      },
      {
        paymentStatus: 'Pending',
        holdExpiresAt: null,
        paymentMethod: { $ne: 'Pay at Hotel Desk' },
        createdAt: { $gt: legacyCutoff }
      }
    ]
  };
};

/**
 * Checks in-memory if a given booking object is actively holding room dates.
 */
const isBookingHoldActive = (booking) => {
  if (!booking) return false;
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) return false;
  if (booking.paymentStatus === 'Paid') return true;
  if (booking.paymentMethod === 'Pay at Hotel Desk' && booking.paymentStatus !== 'Failed') return true;
  if (booking.paymentStatus !== 'Pending') return false;

  if (booking.holdExpiresAt) {
    return new Date(booking.holdExpiresAt) > new Date();
  }

  const legacyCutoff = Date.now() - getHoldExpiryMinutes() * 60 * 1000;
  return booking.createdAt ? new Date(booking.createdAt).getTime() > legacyCutoff : false;
};

/**
 * Finds any active overlapping reservation for a room, optionally excluding a booking ID (e.g. self-retry).
 */
const findOverlappingBooking = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return null;
  }

  const query = {
    roomId,
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
    ...getActiveBookingFilter()
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query);
};

/**
 * Returns list of room IDs that have active reservations overlapping the requested check-in/out window.
 */
const getOverlappingBookingRoomIds = async (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return [];
  }

  const query = {
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
    ...getActiveBookingFilter()
  };

  const overlappingBookings = await Booking.find(query).select('roomId');
  return overlappingBookings.map((b) => b.roomId).filter(Boolean);
};

// In-process serialized lock per room to completely prevent race conditions
const roomLocks = new Map();

/**
 * Executes an async action with an exclusive in-process lock on a given room ID.
 * Prevents concurrent overlapping bookings for the same room.
 */
const withRoomLock = async (roomId, fn) => {
  const key = String(roomId);
  const prevPromise = roomLocks.get(key) || Promise.resolve();

  let releaseLock;
  const lockPromise = new Promise((resolve) => {
    releaseLock = resolve;
  });

  const currentPromise = prevPromise
    .catch(() => {})
    .then(async () => {
      try {
        return await fn();
      } finally {
        releaseLock();
      }
    });

  roomLocks.set(key, lockPromise);

  try {
    return await currentPromise;
  } finally {
    if (roomLocks.get(key) === lockPromise) {
      roomLocks.delete(key);
    }
  }
};

module.exports = {
  ACTIVE_BOOKING_STATUSES,
  getHoldExpiryMinutes,
  calculateHoldExpiresAt,
  getActiveBookingFilter,
  isBookingHoldActive,
  findOverlappingBooking,
  getOverlappingBookingRoomIds,
  withRoomLock
};
