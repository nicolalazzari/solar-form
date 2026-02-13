import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { config } from '../../config/env';
import styles from './PropertyMapSelector.module.css';

export default function PropertyMapSelector({
  isOpen,
  onClose,
  initialLatitude,
  initialLongitude,
  fullAddress,
  onConfirm,
}) {
  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLatitude,
    lng: initialLongitude,
  });
  const [hasMoved, setHasMoved] = useState(false);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setMarkerPosition({
        lat: initialLatitude,
        lng: initialLongitude,
      });
      setHasMoved(false);
    }
  }, [isOpen, initialLatitude, initialLongitude]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleMarkerDragEnd = useCallback((e) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
      setHasMoved(true);
    }
  }, []);

  const handleMapClick = useCallback((e) => {
    if (e.detail?.latLng) {
      setMarkerPosition({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
      setHasMoved(true);
    }
  }, []);

  const handleConfirm = () => {
    onConfirm?.(markerPosition.lat, markerPosition.lng);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  // Check if we have a valid API key
  const hasApiKey = config.googleMapsApiKey && config.googleMapsApiKey !== 'your_google_maps_api_key_here';

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select your property</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className={styles.instructions}>
          Drag the marker or click on the map to select your property location.
        </p>

        {fullAddress && (
          <div className={styles.currentAddress}>
            <span className={styles.addressLabel}>Current address:</span>
            <span className={styles.addressValue}>{fullAddress}</span>
          </div>
        )}

        <div className={styles.mapContainer}>
          {hasApiKey ? (
            <APIProvider apiKey={config.googleMapsApiKey}>
              <Map
                defaultCenter={markerPosition}
                defaultZoom={19}
                mapTypeId="satellite"
                tilt={0}
                disableDefaultUI={true}
                zoomControl={true}
                gestureHandling="greedy"
                onClick={handleMapClick}
                mapId="property-selector-map"
              >
                <AdvancedMarker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                >
                  <div className={styles.customMarker}>
                    <div className={styles.markerPin} />
                    <span className={styles.markerLabel}>Drag to move</span>
                  </div>
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            <div className={styles.noApiKey}>
              <p>Google Maps API key not configured.</p>
              <p className={styles.coordinates}>
                Coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className={styles.coordinatesDisplay}>
          <span className={styles.coordLabel}>Selected coordinates:</span>
          <span className={styles.coordValue}>
            {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!hasMoved && hasApiKey}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
