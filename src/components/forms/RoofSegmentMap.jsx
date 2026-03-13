import { useState, useCallback, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { config } from '../../config/env';
import { getOrientationColor, getOrientationFromAzimuth, getOrientationLabel } from '../../utils/orientation';
import styles from './RoofSegmentMap.module.css';

export default function RoofSegmentMap({
  latitude,
  longitude,
  segments,
  selectedSegments,
  onSegmentClick,
}) {
  const [activeSegment, setActiveSegment] = useState(null);

  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    if (segments?.[0]?.center) {
      return {
        lat: segments[0].center.latitude,
        lng: segments[0].center.longitude,
      };
    }
    return { lat: 51.5074, lng: -0.1278 };
  }, [latitude, longitude, segments]);

  const handleMarkerClick = useCallback((index) => {
    onSegmentClick?.(index);
    setActiveSegment(prev => prev === index ? null : index);
  }, [onSegmentClick]);

  // Check if we have a valid API key
  const hasApiKey = config.googleMapsApiKey && config.googleMapsApiKey !== 'your_google_maps_api_key_here';

  // Render fallback if no API key
  if (!hasApiKey) {
    return (
      <div className={styles.container}>
        <div className={styles.mapWrapper}>
          <div className={styles.noApiKey}>
            <p>Google Maps API key not configured.</p>
            <p className={styles.fallbackInfo}>
              {segments?.length || 0} roof segments detected
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <APIProvider apiKey={config.googleMapsApiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={20}
            mapTypeId="satellite"
            tilt={0}
            disableDefaultUI={true}
            zoomControl={true}
            gestureHandling="cooperative"
            mapId="roof-segment-map"
          >
            {segments?.map((segment, index) => {
              const markerCenter = segment.center || (segment.boundingBox && {
                latitude: (segment.boundingBox.sw.latitude + segment.boundingBox.ne.latitude) / 2,
                longitude: (segment.boundingBox.sw.longitude + segment.boundingBox.ne.longitude) / 2,
              });

              if (!markerCenter) return null;

              const colors = getOrientationColor(segment.azimuth);
              const isSelected = selectedSegments?.includes(index);
              const bgColor = isSelected ? colors.badgeSolid : colors.badge;
              const pos = { lat: markerCenter.latitude, lng: markerCenter.longitude };

              return (
                <AdvancedMarker key={`marker-${index}`} position={pos}>
                  <div
                    className={`${styles.segmentMarker} ${isSelected ? styles.selected : ''}`}
                    style={{ backgroundColor: bgColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(index);
                    }}
                  >
                    {index + 1}
                  </div>
                </AdvancedMarker>
              );
            })}

            {activeSegment !== null && segments?.[activeSegment] && (() => {
              const seg = segments[activeSegment];
              const mc = seg.center || (seg.boundingBox && {
                latitude: (seg.boundingBox.sw.latitude + seg.boundingBox.ne.latitude) / 2,
                longitude: (seg.boundingBox.sw.longitude + seg.boundingBox.ne.longitude) / 2,
              });
              if (!mc) return null;
              const isSelected = selectedSegments?.includes(activeSegment);
              const orient = getOrientationFromAzimuth(seg.azimuth);
              const colors = getOrientationColor(seg.azimuth);
              const energy = seg.estimatedEnergy || 0;
              const energyStr = energy >= 1000 ? `${(energy / 1000).toFixed(1)} MWh` : `${Math.round(energy)} kWh`;

              return (
                <InfoWindow
                  position={{ lat: mc.latitude, lng: mc.longitude }}
                  onCloseClick={() => setActiveSegment(null)}
                >
                  <div className={styles.infoWindow}>
                    <div className={styles.infoHeader}>
                      <span className={styles.infoTitle}>Segment {activeSegment + 1}</span>
                      <span className={styles.infoBadge} style={{ backgroundColor: colors.badgeSolid }}>
                        {getOrientationLabel(orient)}
                      </span>
                      <span className={`${styles.infoStatus} ${isSelected ? styles.infoSelected : styles.infoDeselected}`}>
                        {isSelected ? '✓' : '○'}
                      </span>
                    </div>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoValue}>{seg.adjustedPanelCount ?? seg.panelCount ?? 0}</span>
                        <span className={styles.infoLabel}>Panels</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoValue}>{energyStr}</span>
                        <span className={styles.infoLabel}>Energy/yr</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoValue}>{(seg.usableArea ?? seg.area)?.toFixed(0) || 0}m²</span>
                        <span className={styles.infoLabel}>Area</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoValue}>{seg.pitch?.toFixed(0) || 0}°</span>
                        <span className={styles.infoLabel}>Pitch</span>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              );
            })()}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
