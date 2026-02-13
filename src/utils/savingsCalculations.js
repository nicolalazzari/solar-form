/**
 * Savings calculation utilities
 * Based on 50% self-consumption of estimated energy production
 * Plus Smart Export Guarantee earnings at 5p/kWh for exported energy
 */

// Average UK electricity price in pounds per kWh
const ELECTRICITY_PRICE_PER_KWH = 0.24;

// Smart Export Guarantee rate in pounds per kWh
const SEG_RATE_PER_KWH = 0.05;

// Self-consumption percentage (50%)
const SELF_CONSUMPTION_RATE = 0.5;

// Average annual electricity usage by number of bedrooms (kWh)
const USAGE_BY_BEDROOMS = {
  1: 1800,  // 1 bedroom flat/studio
  2: 2700,  // 2 bedroom property
  3: 3100,  // 3 bedroom property
  4: 4000,  // 4 bedroom property
  5: 4600,  // 5+ bedroom property
};

/**
 * Get estimated annual electricity usage based on number of bedrooms
 * @param {number} bedrooms - Number of bedrooms (1-5+)
 * @returns {number} Estimated annual usage in kWh
 */
export const getAnnualUsageByBedrooms = (bedrooms) => {
  const rooms = Math.min(Math.max(bedrooms || 3, 1), 5);
  return USAGE_BY_BEDROOMS[rooms];
};

/**
 * Calculate estimated annual savings from solar panel installation
 *
 * Calculation:
 * 1. Self-consumed energy (50%) saves money at electricity rate
 * 2. Exported energy (50%) earns money via Smart Export Guarantee
 *
 * @param {number} estimatedEnergy - Total estimated energy production in kWh/year
 * @param {number} annualUsage - Annual electricity usage in kWh (optional, defaults to 3100)
 * @returns {object} Savings breakdown
 */
export const calculateAnnualSavings = (estimatedEnergy, annualUsage = 3100) => {
  if (!estimatedEnergy || estimatedEnergy <= 0) {
    return {
      totalSavings: 0,
      selfConsumptionSavings: 0,
      exportEarnings: 0,
      selfConsumedEnergy: 0,
      exportedEnergy: 0,
    };
  }

  // Energy that can be self-consumed (limited by usage)
  const maxSelfConsumption = estimatedEnergy * SELF_CONSUMPTION_RATE;
  const selfConsumedEnergy = Math.min(maxSelfConsumption, annualUsage * SELF_CONSUMPTION_RATE);

  // Remaining energy is exported
  const exportedEnergy = estimatedEnergy - selfConsumedEnergy;

  // Savings from self-consumed energy (avoided electricity cost)
  const selfConsumptionSavings = selfConsumedEnergy * ELECTRICITY_PRICE_PER_KWH;

  // Earnings from exported energy (Smart Export Guarantee)
  const exportEarnings = exportedEnergy * SEG_RATE_PER_KWH;

  // Total annual savings
  const totalSavings = selfConsumptionSavings + exportEarnings;

  return {
    totalSavings: Math.round(totalSavings),
    selfConsumptionSavings: Math.round(selfConsumptionSavings),
    exportEarnings: Math.round(exportEarnings),
    selfConsumedEnergy: Math.round(selfConsumedEnergy),
    exportedEnergy: Math.round(exportedEnergy),
  };
};

/**
 * Format savings amount as currency string
 * @param {number} amount - Amount in pounds
 * @returns {string} Formatted currency string (e.g., "£1,322")
 */
export const formatSavings = (amount) => {
  return `£${amount.toLocaleString('en-GB')}`;
};

/**
 * Get the savings disclaimer text
 * @returns {string} Disclaimer text for savings calculation
 */
export const getSavingsDisclaimer = () => {
  return 'Based on 50% self-consumption of your estimated yearly production, plus Smart Export Guarantee earnings at 5p/kWh. Actual savings depend on your usage patterns and energy prices.';
};
