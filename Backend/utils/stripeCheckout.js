const { getStripe, frontendBaseUrl } = require('./stripeClient');

const createCheckoutSessionForBooking = async (booking) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const origin = frontendBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: booking.userEmail,
    success_url: `${origin}/dashboard?stripe=success&bookingId=${booking._id}`,
    cancel_url: `${origin}/dashboard?stripe=cancel&bookingId=${booking._id}`,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.roomName} — ${booking.bookingNumber}`,
            description: `${booking.nights} night(s), ${booking.guestsCount} guest(s)`
          },
          unit_amount: Math.round(Number(booking.totalPrice) * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: String(booking._id),
      bookingNumber: booking.bookingNumber
    }
  });

  return session;
};

module.exports = { createCheckoutSessionForBooking };
