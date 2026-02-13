import { useEffect, useRef } from 'react';
import { getOrientationFromAzimuth, getOrientationColor, getOrientationLabel } from '../../utils/orientation';
import styles from './RoofFaceInfoOverlay.module.css';

export default function RoofFaceInfoOverlay({
  segment,
  segmentNumber,
  position,
  isBottomSheet,
  onClose,
}) {
  const overlayRef = useRef(null);

  // Close on click outside for bottom sheet
  useEffect(() => {
    if (!isBottomSheet) return;

    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBottomSheet, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!segment) return null;

  const orientation = getOrientationFromAzimuth(segment.azimuth);
  const colors = getOrientationColor(segment.azimuth);

  const formatEnergy = (energy) => {
    if (energy >= 1000) {
      return `${(energy / 1000).toFixed(1)} MWh`;
    }
    return `${Math.round(energy)} kWh`;
  };

  const formatArea = (area) => {
    return `${area?.toFixed(1) || 0} m²`;
  };

  // Desktop tooltip positioning
  const tooltipStyle = !isBottomSheet && position ? {
    left: `${position.x}px`,
    top: `${position.y}px`,
  } : {};

  if (isBottomSheet) {
    return (
      <div className={styles.bottomSheetOverlay}>
        <div className={styles.bottomSheet} ref={overlayRef}>
          <div className={styles.bottomSheetHandle} />

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>

          <div className={styles.header}>
            <span className={styles.segmentNumber}>Segment {segmentNumber}</span>
            <span
              className={styles.orientationBadge}
              style={{ backgroundColor: colors.badge }}
            >
              {getOrientationLabel(orientation)}
            </span>
          </div>

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Panel count</span>
              <span className={styles.detailValue}>
                {segment.adjustedPanelCount ?? segment.panelCount ?? 0}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Est. energy</span>
              <span className={styles.detailValue}>
                {formatEnergy(segment.estimatedEnergy || 0)}/year
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Usable area</span>
              <span className={styles.detailValue}>
                {formatArea(segment.usableArea ?? segment.area)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Roof pitch</span>
              <span className={styles.detailValue}>{segment.pitch}°</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop tooltip
  return (
    <div className={styles.tooltip} style={tooltipStyle} ref={overlayRef}>
      <div className={styles.header}>
        <span className={styles.segmentNumber}>Segment {segmentNumber}</span>
        <span
          className={styles.orientationBadge}
          style={{ backgroundColor: colors.badge }}
        >
          {getOrientationLabel(orientation)}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Panel count</span>
          <span className={styles.detailValue}>
            {segment.adjustedPanelCount ?? segment.panelCount ?? 0}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Est. energy</span>
          <span className={styles.detailValue}>
            {formatEnergy(segment.estimatedEnergy || 0)}/year
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Usable area</span>
          <span className={styles.detailValue}>
            {formatArea(segment.usableArea ?? segment.area)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Roof pitch</span>
          <span className={styles.detailValue}>{segment.pitch}°</span>
        </div>
      </div>
    </div>
  );
}
