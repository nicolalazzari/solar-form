// Orientation colour mapping based on azimuth
// South (135-225°): Best for solar - Green
// East (45-135°): Good - Blue
// West (225-315°): Good - Orange
// North (315-360° and 0-45°): Least suitable - Red

export const ORIENTATION_COLORS = {
  south: {
    fill: 'rgba(34, 197, 94, 0.6)',
    stroke: 'rgba(22, 163, 74, 0.8)',
    badge: 'rgba(34, 197, 94, 0.6)', // 60% opacity green
    badgeSolid: '#22c55e',
  },
  east: {
    fill: 'rgba(59, 130, 246, 0.6)',
    stroke: 'rgba(37, 99, 235, 0.8)',
    badge: 'rgba(59, 130, 246, 0.6)', // 60% opacity blue
    badgeSolid: '#3b82f6',
  },
  west: {
    fill: 'rgba(249, 115, 22, 0.6)',
    stroke: 'rgba(234, 88, 12, 0.8)',
    badge: 'rgba(249, 115, 22, 0.6)', // 60% opacity orange
    badgeSolid: '#f97316',
  },
  north: {
    fill: 'rgba(239, 68, 68, 0.6)',
    stroke: 'rgba(220, 38, 38, 0.8)',
    badge: 'rgba(239, 68, 68, 0.6)', // 60% opacity red
    badgeSolid: '#ef4444',
  },
};

/**
 * Get cardinal orientation from azimuth angle
 * @param {number} azimuth - Compass direction in degrees (0-360, 0=North)
 * @returns {'north'|'east'|'south'|'west'}
 */
export const getOrientationFromAzimuth = (azimuth) => {
  // Normalize azimuth to 0-360 range
  const normalizedAzimuth = ((azimuth % 360) + 360) % 360;

  if (normalizedAzimuth >= 315 || normalizedAzimuth < 45) return 'north';
  if (normalizedAzimuth >= 45 && normalizedAzimuth < 135) return 'east';
  if (normalizedAzimuth >= 135 && normalizedAzimuth < 225) return 'south';
  return 'west';
};

/**
 * Get human-readable orientation label
 * @param {'north'|'east'|'south'|'west'} orientation
 * @returns {string}
 */
export const getOrientationLabel = (orientation) => {
  const labels = {
    north: 'North',
    east: 'East',
    south: 'South',
    west: 'West',
  };
  return labels[orientation] || orientation;
};

/**
 * Get colour scheme for a given azimuth
 * @param {number} azimuth - Compass direction in degrees
 * @returns {{ fill: string, stroke: string, badge: string }}
 */
export const getOrientationColor = (azimuth) => {
  const orientation = getOrientationFromAzimuth(azimuth);
  return ORIENTATION_COLORS[orientation];
};

/**
 * Check if azimuth is north-facing (least suitable for solar)
 * @param {number} azimuth - Compass direction in degrees
 * @returns {boolean}
 */
export const isNorthFacing = (azimuth) => {
  return getOrientationFromAzimuth(azimuth) === 'north';
};
