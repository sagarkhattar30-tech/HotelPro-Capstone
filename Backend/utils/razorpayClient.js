const crypto = require('crypto');
let Razorpay = null;
try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}

const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || '';
const getRazorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET || '';
const getRazorpayWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET || '';

const isRazorpayConfigured = () => {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
};

const getRazorpayInstance = () => {
  if (!isRazorpayConfigured() || !Razorpay) return null;
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret()
  });
};

/**
 * Calculates INR amount in paise server-side based on booking totalPrice
 * @param {number} totalPrice - Booking total price in USD
 * @returns {{ inrTotal: number, amountInPaise: number }}
 */
const calculateInrAmount = (totalPrice) => {
  const rate = Number(process.env.USD_TO_INR_RATE) || 83;
  const inrTotal = Math.round(Number(totalPrice || 0) * rate);
  const amountInPaise = inrTotal * 100;
  return { inrTotal, amountInPaise, rate };
};

/**
 * Verifies Razorpay payment signature
 * Signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const secret = getRazorpayKeySecret();
  if (!secret || !orderId || !paymentId || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const sigBuf = Buffer.from(String(signature), 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
};

/**
 * Verifies Razorpay webhook signature
 * Webhook signature = HMAC_SHA256(raw_body, webhook_secret)
 */
const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !rawBody || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(String(signature), 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
};

module.exports = {
  isRazorpayConfigured,
  getRazorpayInstance,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
  calculateInrAmount,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature
};
