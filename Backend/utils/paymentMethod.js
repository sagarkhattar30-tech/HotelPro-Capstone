const normalizePaymentMethod = (raw) => {
  const value = String(raw || '').toLowerCase();
  if (value.includes('hotel')) return 'Pay at Hotel Desk';
  if (value.includes('stripe') || value.includes('upi')) return 'Stripe';
  if (value.includes('simulat')) return 'Credit Card (Simulated)';
  return 'Credit Card';
};

const wantsOnlineCard = (method) => method === 'Credit Card' || method === 'Stripe';

module.exports = { normalizePaymentMethod, wantsOnlineCard };
