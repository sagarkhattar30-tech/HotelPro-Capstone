let stripeSingleton = null;

const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

const getStripe = () => {
  if (!isStripeConfigured()) return null;
  if (!stripeSingleton) {
    // Lazy-load so tests and demo mode run without Stripe keys
    // eslint-disable-next-line global-require
    const Stripe = require('stripe');
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
};

const frontendBaseUrl = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

module.exports = { isStripeConfigured, getStripe, frontendBaseUrl };
