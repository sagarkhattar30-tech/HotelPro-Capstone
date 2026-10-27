const normalizePaymentMethod = (raw) => {
  const value = String(raw || '').toLowerCase();
  if (value.includes('hotel') || value.includes('desk')) return 'Pay at Hotel Desk';
  if (value.includes('razorpay')) return 'Razorpay';
  if (value.includes('stripe')) return 'Stripe';
  return 'Credit Card';
};

const wantsOnlineCard = (method) => method === 'Credit Card' || method === 'Stripe' || method === 'Razorpay';
const wantsOnlinePayment = wantsOnlineCard;

module.exports = { normalizePaymentMethod, wantsOnlineCard, wantsOnlinePayment };
