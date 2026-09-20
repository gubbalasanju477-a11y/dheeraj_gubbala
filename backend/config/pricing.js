/**
 * Pricing configuration for print jobs.
 *
 * Rates are in rupees per page. Edit RATES_PER_PAGE below to change
 * pricing — nothing else in the codebase needs to change.
 *
 * NOTE: The task only specified A4 rates (B&W ₹2/page, Color ₹10/page).
 * A3 and Letter rates below are placeholder values so every paperSize/
 * colorMode combination the PrintOrder model accepts has a price —
 * adjust them to your real rates whenever you're ready.
 */
const RATES_PER_PAGE = {
  A4: {
    "black-white": 2,
    color: 10,
  },
  A3: {
    "black-white": 4, // placeholder — adjust to your real A3 rate
    color: 15, // placeholder — adjust to your real A3 rate
  },
  Letter: {
    "black-white": 2, // placeholder — adjust to your real Letter rate
    color: 10, // placeholder — adjust to your real Letter rate
  },
};

/**
 * Calculates the total price for a print order.
 * price = pages × copies × rate-per-page(paperSize, colorMode)
 */
function calculatePrice({ pages, copies, paperSize, colorMode }) {
  const sizeRates = RATES_PER_PAGE[paperSize];
  if (!sizeRates) {
    throw new Error(`No pricing configured for paper size "${paperSize}"`);
  }

  const rate = sizeRates[colorMode];
  if (rate === undefined) {
    throw new Error(`No pricing configured for color mode "${colorMode}" on "${paperSize}"`);
  }

  const price = pages * copies * rate;
  return Math.round(price * 100) / 100; // avoid floating-point noise
}

module.exports = { RATES_PER_PAGE, calculatePrice };
