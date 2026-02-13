import { useState, useCallback, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { config } from '../../config/env';
import { getOrientationColor } from '../../utils/orientation';
import RoofFaceInfoOverlay from './RoofFaceInfoOverlay';
import styles from './RoofSegmentMap.module.css';

export default function RoofSegmentMap({
  latitude,
  longitude,
  segments,
  selectedSegments,
  onSegmentClick,
}) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tappedSegment, setTappedSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get center point for map
  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    // Fallback to first segment center
    if (segments?.[0]?.center) {
      return {
        lat: segments[0].center.latitude,
        lng: segments[0].center.longitude,
      };
    }
    return { lat: 51.5074, lng: -0.1278 }; // Default to London
  }, [latitude, longitude, segments]);

  const handleMarkerClick = useCallback((index, e) => {
    // Set tooltip position for desktop hover
    if (e?.domEvent) {
      setTooltipPosition({
        x: e.domEvent.clientX,
        y: e.domEvent.clientY,
      });
    }

    if (isMobile) {
      setTappedSegment(index);
    } else {
      onSegmentClick?.(index);
    }
  }, [isMobile, onSegmentClick]);

  const handleMarkerHover = useCallback((index, e) => {
    if (!isMobile) {
      setHoveredSegment(index);
      if (e?.domEvent) {
        setTooltipPosition({
          x: e.domEvent.clientX,
          y: e.domEvent.clientY,
        });
      }
    }
  }, [isMobile]);

  const handleMarkerLeave = useCallback(() => {
    if (!isMobile) {
      setHoveredSegment(null);
      setTooltipPosition(null);
    }
  }, [isMobile]);

  const handleCloseBottomSheet = useCallback(() => {
    setTappedSegment(null);
  }, []);

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
            {/* Numbered markers for each segment */}
            {segments?.map((segment, index) => {
              const markerCenter = segment.center || (segment.boundingBox && {
                latitude: (segment.boundingBox.sw.latitude + segment.boundingBox.ne.latitude) / 2,
                longitude: (segment.boundingBox.sw.longitude + segment.boundingBox.ne.longitude) / 2,
              });

              if (!markerCenter) return null;

              const colors = getOrientationColor(segment.azimuth);
              const isSelected = selectedSegments?.includes(index);

              // Use same orientation color - selected is less transparent (badgeSolid)
              const bgColor = isSelected ? colors.badgeSolid : colors.badge;

              return (
                <AdvancedMarker
                  key={`marker-${index}`}
                  position={{
                    lat: markerCenter.latitude,
                    lng: markerCenter.longitude,
                  }}
                  onClick={(e) => handleMarkerClick(index, e)}
                >
                  <div
                    className={`${styles.segmentMarker} ${isSelected ? styles.selected : ''}`}
                    style={{
                      backgroundColor: bgColor,
                    }}
                    onMouseEnter={(e) => handleMarkerHover(index, { domEvent: e })}
                    onMouseLeave={handleMarkerLeave}
                  >
                    {index + 1}
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Desktop tooltip */}
      {!isMobile && hoveredSegment !== null && segments?.[hoveredSegment] && (
        <RoofFaceInfoOverlay
          segment={segments[hoveredSegment]}
          segmentNumber={hoveredSegment + 1}
          position={tooltipPosition}
          isBottomSheet={false}
          onClose={() => setHoveredSegment(null)}
        />
      )}

      {/* Mobile bottom sheet */}
      {isMobile && tappedSegment !== null && segments?.[tappedSegment] && (
        <RoofFaceInfoOverlay
          segment={segments[tappedSegment]}
          segmentNumber={tappedSegment + 1}
          position={null}
          isBottomSheet={true}
          onClose={handleCloseBottomSheet}
        />
      )}
    </div>
  );
}
