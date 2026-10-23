const Booking = require('../models/Booking');

const ACTIVE_BOOKING_STATUSES = ['Confirmed', 'Checked-In'];

const findOverlappingBooking = async (roomId, checkIn, checkOut, excludeBookingId) => {
  const query = {
    roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn }
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  return Booking.findOne(query);
};

module.exports = { ACTIVE_BOOKING_STATUSES, findOverlappingBooking };
