const { getStripe, frontendBaseUrl } = require('./stripeClient');
const { convertInrToEur } = require('./currencyConverter');

/**
 * Creates a Stripe Checkout Session in Euros (€, EUR)
 * converted from the Indian Rupee (INR ₹) reservation amount.
 */
const createCheckoutSessionForBooking = async (booking) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Calculate canonical INR amount for this reservation
  const inrTotal = booking.totalPriceInr || Math.round(Number(booking.totalPrice) * 83);
  const { eurAmount, eurAmountCents, exchangeRate } = convertInrToEur(inrTotal);

  const origin = frontendBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: booking.userEmail,
    success_url: `${origin}/my-bookings?stripe=success&bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking-confirmation/${booking._id}?stripe=cancel`,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${booking.roomName} — ${booking.bookingNumber}`,
            description: `${booking.nights} night(s), ${booking.guestsCount} guest(s) | ₹${inrTotal.toLocaleString('en-IN')} (Tariff converted at €1 ≈ ₹${exchangeRate})`,
            images: (booking.roomImage && booking.roomImage.startsWith('https://')) ? [booking.roomImage] : []
          },
          unit_amount: eurAmountCents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: String(booking._id),
      bookingNumber: booking.bookingNumber,
      userEmail: booking.userEmail,
      inrTotal: String(inrTotal),
      eurAmount: String(eurAmount),
      exchangeRate: String(exchangeRate),
      currency: 'EUR'
    },
    client_reference_id: String(booking._id)
  });

  return { session, inrTotal, eurAmount, eurAmountCents, exchangeRate, currency: 'EUR' };
};

module.exports = { createCheckoutSessionForBooking };
