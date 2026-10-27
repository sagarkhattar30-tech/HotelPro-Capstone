/**
 * Currency Conversion Engine: Indian Rupee (INR ₹) to British Pound (GBP £)
 * Used by Aatithya to display prices in Indian Rupees on the website and
 * seamlessly charge international cards in British Pounds (£) via Stripe.
 */

const getGbpToInrRate = () => {
  const rate = parseFloat(process.env.GBP_TO_INR_RATE || '110');
  return isNaN(rate) || rate <= 0 ? 110 : rate;
};

const getEurToInrRate = () => {
  const rate = parseFloat(process.env.EUR_TO_INR_RATE || '110');
  return isNaN(rate) || rate <= 0 ? 110 : rate;
};

const getUsdToInrRate = () => {
  const rate = parseFloat(process.env.USD_TO_INR_RATE || '83');
  return isNaN(rate) || rate <= 0 ? 83 : rate;
};

/**
 * Calculates the canonical INR amount for a given base/USD price
 */
const calculateInrFromBase = (basePrice) => {
  const rate = getUsdToInrRate();
  return Math.round(Number(basePrice || 0) * rate);
};

/**
 * Converts an amount in Indian Rupees (INR ₹) to Euros (EUR €) for Stripe checkout
 *
 * @param {number} inrAmount - Total in Indian Rupees
 * @returns {{ inrAmount: number, eurAmount: number, eurAmountCents: number, exchangeRate: number }}
 */
const convertInrToEur = (inrAmount) => {
  const rate = getEurToInrRate();
  const inr = Math.max(0, Math.round(Number(inrAmount || 0)));
  const eur = inr / rate;
  const eurAmount = Math.round(eur * 100) / 100; // rounded to 2 decimal places e.g. 422.55
  const eurAmountCents = Math.round(eurAmount * 100); // smallest currency unit for Stripe (cents)

  return {
    inrAmount: inr,
    eurAmount,
    eurAmountCents,
    exchangeRate: rate
  };
};

/**
 * Converts an amount in Indian Rupees (INR ₹) to British Pounds (GBP £) for Stripe checkout
 *
 * @param {number} inrAmount - Total in Indian Rupees
 * @returns {{ inrAmount: number, gbpAmount: number, gbpAmountPence: number, exchangeRate: number }}
 */
const convertInrToGbp = (inrAmount) => {
  const rate = getGbpToInrRate();
  const inr = Math.max(0, Math.round(Number(inrAmount || 0)));
  const gbp = inr / rate;
  const gbpAmount = Math.round(gbp * 100) / 100; // rounded to 2 decimal places e.g. 150.25
  const gbpAmountPence = Math.round(gbpAmount * 100); // smallest currency unit for Stripe (pence)

  return {
    inrAmount: inr,
    gbpAmount,
    gbpAmountPence,
    exchangeRate: rate
  };
};

module.exports = {
  getGbpToInrRate,
  getEurToInrRate,
  getUsdToInrRate,
  calculateInrFromBase,
  convertInrToEur,
  convertInrToGbp
};
