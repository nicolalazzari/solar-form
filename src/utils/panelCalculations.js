// Panel size calculations for adjusting Google Solar API values
// to Project Solar's larger panel dimensions

// Google's default panel dimensions (from API documentation)
const GOOGLE_PANEL_WIDTH = 1.045; // metres
const GOOGLE_PANEL_HEIGHT = 1.879; // metres
const GOOGLE_PANEL_AREA = GOOGLE_PANEL_WIDTH * GOOGLE_PANEL_HEIGHT; // ~1.963 m²

// Project Solar panel dimensions
const PROJECT_SOLAR_PANEL_WIDTH = 2.0; // metres
const PROJECT_SOLAR_PANEL_HEIGHT = 1.2; // metres
const PROJECT_SOLAR_PANEL_AREA = PROJECT_SOLAR_PANEL_WIDTH * PROJECT_SOLAR_PANEL_HEIGHT; // 2.4 m²

// Base size ratio (Project Solar panels are larger)
const BASE_PANEL_RATIO = PROJECT_SOLAR_PANEL_AREA / GOOGLE_PANEL_AREA; // ~1.222

// Medium quality imagery buffer (15% larger effective area due to less precise boundaries)
const MEDIUM_QUALITY_BUFFER = 1.15;

/**
 * Calculate the effective panel ratio based on imagery quality
 * @param {string} imageryQuality - 'high' or 'medium'
 * @returns {number} Effective ratio for panel count adjustment
 */
export const calculateEffectivePanelRatio = (imageryQuality) => {
  if (imageryQuality?.toLowerCase() === 'medium') {
    return BASE_PANEL_RATIO * MEDIUM_QUALITY_BUFFER; // ~1.405
  }
  return BASE_PANEL_RATIO; // ~1.222
};

/**
 * Adjust Google's panel count for Project Solar's larger panels
 * @param {number} googlePanelCount - Panel count from Google Solar API
 * @param {number} effectiveRatio - Ratio from calculateEffectivePanelRatio
 * @returns {number} Adjusted panel count (floored to whole number)
 */
export const adjustPanelCount = (googlePanelCount, effectiveRatio) => {
  if (!googlePanelCount || googlePanelCount <= 0) return 0;
  return Math.floor(googlePanelCount / effectiveRatio);
};

/**
 * Calculate usable area based on adjusted panel count
 * @param {number} adjustedPanelCount - Adjusted panel count
 * @param {string} imageryQuality - 'high' or 'medium'
 * @returns {number} Usable area in m²
 */
export const calculateUsableArea = (adjustedPanelCount, imageryQuality) => {
  const effectiveArea = imageryQuality?.toLowerCase() === 'medium'
    ? PROJECT_SOLAR_PANEL_AREA * MEDIUM_QUALITY_BUFFER
    : PROJECT_SOLAR_PANEL_AREA;

  return adjustedPanelCount * effectiveArea;
};

/**
 * Process segments from Google Solar API with adjusted panel counts
 * @param {Array} segments - Array of segment objects from API
 * @param {string} imageryQuality - 'high' or 'medium'
 * @returns {Array} Segments with adjusted panel counts
 */
export const adjustSegmentPanelCounts = (segments, imageryQuality) => {
  if (!segments || !Array.isArray(segments)) return [];

  const effectiveRatio = calculateEffectivePanelRatio(imageryQuality);

  return segments.map((segment) => {
    const googlePanelCount = segment.panelCount || segment.googlePanelCount || 0;
    const adjustedPanelCount = adjustPanelCount(googlePanelCount, effectiveRatio);

    return {
      ...segment,
      googlePanelCount,
      panelCount: adjustedPanelCount, // Override with adjusted count
      adjustedPanelCount,
      usableArea: calculateUsableArea(adjustedPanelCount, imageryQuality),
    };
  });
};

/**
 * Calculate estimated energy for a segment
 * @param {Object} segment - Segment with panelCount and sunshineQuantiles
 * @returns {number} Estimated annual energy in kWh
 */
export const estimateSegmentEnergy = (segment) => {
  // Use API value if available
  if (segment.yearlyEnergyDcKwh && segment.yearlyEnergyDcKwh > 0) {
    return segment.yearlyEnergyDcKwh;
  }

  // Calculate from panel count and sunshine
  const panels = segment.panelCount ?? segment.adjustedPanelCount ?? 0;
  const avgSunshine = getAverageSunshine(segment.sunshineQuantiles);

  // Formula: panels x 0.5kW x sunshine_hours x 0.9 efficiency
  return Math.round(panels * 0.5 * avgSunshine * 0.9);
};

/**
 * Calculate average sunshine hours from quantiles array
 * @param {number[]} sunshineQuantiles - Array of 11 quantile values
 * @returns {number} Average sunshine hours
 */
export const getAverageSunshine = (sunshineQuantiles) => {
  if (!sunshineQuantiles || sunshineQuantiles.length === 0) return 1000; // Default
  return sunshineQuantiles.reduce((acc, val) => acc + val, 0) / sunshineQuantiles.length;
};

// Export constants for reference
export const PANEL_DIMENSIONS = {
  google: { width: GOOGLE_PANEL_WIDTH, height: GOOGLE_PANEL_HEIGHT, area: GOOGLE_PANEL_AREA },
  projectSolar: { width: PROJECT_SOLAR_PANEL_WIDTH, height: PROJECT_SOLAR_PANEL_HEIGHT, area: PROJECT_SOLAR_PANEL_AREA },
  baseRatio: BASE_PANEL_RATIO,
  mediumQualityBuffer: MEDIUM_QUALITY_BUFFER,
};
