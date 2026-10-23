const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { getStripe } = require('../utils/stripeClient');
const { sendBookingConfirmationEmail } = require('../utils/emailService');

const markBookingPaidFromStripe = async (session) => {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.paymentStatus === 'Paid') return;

  booking.paymentStatus = 'Paid';
  booking.status = booking.status === 'Cancelled' ? booking.status : 'Confirmed';
  booking.transactionId = session.payment_intent ? String(session.payment_intent) : session.id;
  booking.stripeSessionId = session.id;
  booking.stripePaymentIntentId = session.payment_intent ? String(session.payment_intent) : booking.stripePaymentIntentId;
  await booking.save();

  await Payment.findOneAndUpdate(
    { bookingId: booking._id },
    {
      status: 'Completed',
      transactionId: booking.transactionId,
      paymentMethod: 'Stripe',
      paidAt: new Date()
    }
  );

  sendBookingConfirmationEmail({
    userEmail: booking.userEmail,
    userName: booking.userName,
    bookingNumber: booking.bookingNumber,
    roomName: booking.roomName,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    totalPrice: booking.totalPrice
  }).catch(() => {});
};

const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).json({ message: 'Stripe webhook is not configured' });
  }

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        await markBookingPaidFromStripe(session);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = { handleStripeWebhook, markBookingPaidFromStripe };
