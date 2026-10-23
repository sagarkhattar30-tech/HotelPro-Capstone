const Notification = require('../models/Notification');

/**
 * Service to simulate transactional hotel emails (Booking, Check-in, Invoice)
 * Logs to console and generates in-app notifications
 */
const sendBookingConfirmationEmail = async ({ userEmail, userName, bookingNumber, roomName, checkInDate, checkOutDate, totalPrice }) => {
  const subject = `Booking Confirmation - ${bookingNumber} | HotelPro Luxury Resort`;
  const message = `Dear ${userName}, your reservation for ${roomName} (${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()}) is confirmed. Total: $${totalPrice}.`;

  console.log(`[EMAIL DISPATCH] To: ${userEmail} | Subject: "${subject}"`);
  console.log(`[EMAIL BODY] ${message}`);

  try {
    await Notification.create({
      recipientEmail: userEmail,
      role: 'Guest',
      title: subject,
      message,
      type: 'booking'
    });
  } catch (e) {
    console.error('Notification creation failed:', e.message);
  }
};

const sendCheckInEmail = async ({ userEmail, guestName, roomNumber, keyCardCode }) => {
  const subject = `Welcome to HotelPro! Your Digital Key for Room ${roomNumber}`;
  const message = `Welcome ${guestName}! You have successfully checked into Room ${roomNumber}. Your digital keycode is: ${keyCardCode}. Enjoy your luxury stay.`;

  console.log(`[EMAIL DISPATCH] To: ${userEmail} | Subject: "${subject}"`);

  try {
    await Notification.create({
      recipientEmail: userEmail,
      role: 'Guest',
      title: subject,
      message,
      type: 'checkin'
    });
  } catch (e) {
    console.error('Notification creation failed:', e.message);
  }
};

module.exports = { sendBookingConfirmationEmail, sendCheckInEmail };
