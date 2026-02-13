import {
  getOrientationFromAzimuth,
  getOrientationColor,
  getOrientationLabel,
  isNorthFacing,
} from '../../utils/orientation';
import styles from './RoofSegmentSelection.module.css';

export default function RoofSegmentSelection({
  segments,
  selectedSegments,
  onSegmentToggle
}) {
  const isSelected = (index) => selectedSegments.includes(index);

  const getDetailedDirection = (azimuth) => {
    // More detailed 8-point compass
    const normalizedAzimuth = ((azimuth % 360) + 360) % 360;
    if (normalizedAzimuth >= 337.5 || normalizedAzimuth < 22.5) return 'North';
    if (normalizedAzimuth >= 22.5 && normalizedAzimuth < 67.5) return 'North-East';
    if (normalizedAzimuth >= 67.5 && normalizedAzimuth < 112.5) return 'East';
    if (normalizedAzimuth >= 112.5 && normalizedAzimuth < 157.5) return 'South-East';
    if (normalizedAzimuth >= 157.5 && normalizedAzimuth < 202.5) return 'South';
    if (normalizedAzimuth >= 202.5 && normalizedAzimuth < 247.5) return 'South-West';
    if (normalizedAzimuth >= 247.5 && normalizedAzimuth < 292.5) return 'West';
    return 'North-West';
  };

  const formatArea = (area) => {
    return `${(area || 0).toFixed(1)} m²`;
  };

  const formatEnergy = (energy) => {
    if (!energy) return '0 kWh/year';
    if (energy >= 1000) {
      return `${(energy / 1000).toFixed(1)} MWh/year`;
    }
    return `${Math.round(energy)} kWh/year`;
  };

  // Calculate totals for selected segments
  const selectedData = selectedSegments.map(i => segments[i]).filter(Boolean);
  const totalPanels = selectedData.reduce((sum, s) => sum + (s.adjustedPanelCount ?? s.panelCount ?? 0), 0);
  const totalEnergy = selectedData.reduce((sum, s) => sum + (s.estimatedEnergy ?? 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.segmentGrid}>
        {segments.map((segment, index) => {
          const selected = isSelected(index);
          const northFacing = isNorthFacing(segment.azimuth);
          const orientation = getOrientationFromAzimuth(segment.azimuth);
          const colors = getOrientationColor(segment.azimuth);
          const panelCount = segment.adjustedPanelCount ?? segment.panelCount ?? 0;

          return (
            <button
              key={index}
              type="button"
              className={`${styles.segmentCard} ${selected ? styles.selected : ''} ${northFacing ? styles.northFacing : ''}`}
              onClick={() => onSegmentToggle(index)}
            >
              <div className={styles.segmentHeader}>
                <span className={styles.segmentNumber}>Segment {index + 1}</span>
                {selected && <span className={styles.checkmark}>&#x2713;</span>}
              </div>

              <div className={styles.orientationRow}>
                <span
                  className={styles.orientationBadge}
                  style={{ backgroundColor: colors.badge }}
                >
                  {getOrientationLabel(orientation)}
                </span>
                <span className={styles.directionDetail}>
                  {getDetailedDirection(segment.azimuth)}
                </span>
              </div>

              <div className={styles.segmentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Panels</span>
                  <span className={styles.detailValue}>{panelCount}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Pitch</span>
                  <span className={styles.detailValue}>{segment.pitch}°</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Area</span>
                  <span className={styles.detailValue}>
                    {formatArea(segment.usableArea ?? segment.area)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Est. Energy</span>
                  <span className={`${styles.detailValue} ${styles.energyValue}`}>
                    {formatEnergy(segment.estimatedEnergy)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Selected segments:</span>
          <span className={styles.summaryValue}>{selectedSegments.length} of {segments.length}</span>
        </div>
        {selectedSegments.length > 0 && (
          <>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total panels:</span>
              <span className={styles.summaryValue}>{totalPanels}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Est. total energy:</span>
              <span className={`${styles.summaryValue} ${styles.energyValue}`}>
                {formatEnergy(totalEnergy)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
