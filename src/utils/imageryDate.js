// Imagery date utilities for handling satellite imagery age warnings

/**
 * Get the earliest date between imagery acquisition and processing dates
 * @param {string} imageryDate - Date when satellite image was acquired
 * @param {string} imageryProcessedDate - Date when Google processed the image
 * @returns {string|null} The earlier date, or null if neither provided
 */
export const getEarliestImageryDate = (imageryDate, imageryProcessedDate) => {
  if (!imageryDate && !imageryProcessedDate) return null;
  if (!imageryDate) return imageryProcessedDate;
  if (!imageryProcessedDate) return imageryDate;

  const date1 = new Date(imageryDate);
  const date2 = new Date(imageryProcessedDate);

  // Handle invalid dates
  if (isNaN(date1.getTime())) return imageryProcessedDate;
  if (isNaN(date2.getTime())) return imageryDate;

  return date1 < date2 ? imageryDate : imageryProcessedDate;
};

/**
 * Calculate the age of imagery in years
 * @param {string} imageryDate - Imagery acquisition date
 * @param {string} imageryProcessedDate - Imagery processed date
 * @returns {number} Age in years (decimal)
 */
export const getImageryAgeYears = (imageryDate, imageryProcessedDate) => {
  const earliestDate = getEarliestImageryDate(imageryDate, imageryProcessedDate);
  if (!earliestDate) return 0;

  const date = new Date(earliestDate);
  if (isNaN(date.getTime())) return 0;

  const now = new Date();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return (now.getTime() - date.getTime()) / msPerYear;
};

/**
 * Check if imagery is older than 2 years (requires warning)
 * @param {string} imageryDate - Imagery acquisition date
 * @param {string} imageryProcessedDate - Imagery processed date
 * @returns {boolean} True if imagery is 2+ years old
 */
export const isImageryOlderThan2Years = (imageryDate, imageryProcessedDate) => {
  return getImageryAgeYears(imageryDate, imageryProcessedDate) >= 2;
};

/**
 * Format imagery date for display in warning message
 * @param {string} imageryDate - Imagery acquisition date
 * @param {string} imageryProcessedDate - Imagery processed date
 * @returns {string} Formatted date string (e.g., "June 2023")
 */
export const formatImageryDateForWarning = (imageryDate, imageryProcessedDate) => {
  const earliestDate = getEarliestImageryDate(imageryDate, imageryProcessedDate);
  if (!earliestDate) return '';

  const date = new Date(earliestDate);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get a short format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "15 Jun 2023")
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
