import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from './types';

interface MapDisplayProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
  height?: string;
  readOnly?: boolean;
}

// Fix Leaflet default icon issue in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const MapDisplay: React.FC<MapDisplayProps> = ({
  location,
  onLocationChange,
  height = '250px',
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Default center (will be updated when location changes)
  const defaultCenter: L.LatLngExpression = location
    ? [location.lat, location.lng]
    : [40.7128, -74.006]; // NYC as default

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: location ? 16 : 4,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tile layer (free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    // Handle map clicks for placing marker (if not read-only)
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMarkerAndLocation(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker when location changes externally
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    if (location) {
      updateMarkerAndLocation(location.lat, location.lng, false);
      // Center map on location with animation
      mapRef.current.setView([location.lat, location.lng], 16, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [location?.lat, location?.lng, isMapReady]);

  const updateMarkerAndLocation = (
    lat: number,
    lng: number,
    notifyParent: boolean = true
  ) => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new draggable marker (if not read-only)
    const marker = L.marker([lat, lng], {
      draggable: !readOnly,
    }).addTo(mapRef.current);

    // Add popup with coordinates
    marker.bindPopup(
      `<div style="font-family: system-ui; font-size: 14px;">
        <strong>Selected Location</strong><br/>
        Lat: ${lat.toFixed(5)}<br/>
        Lng: ${lng.toFixed(5)}
      </div>`,
      { closeButton: false }
    );

    if (!readOnly) {
      // Handle marker drag end
      marker.on('dragend', (e: L.DragEndEvent) => {
        const newPos = e.target.getLatLng();
        updateMarkerAndLocation(newPos.lat, newPos.lng);
      });

      // Show popup on hover
      marker.on('mouseover', () => {
        marker.openPopup();
      });

      marker.on('mouseout', () => {
        marker.closePopup();
      });
    }

    markerRef.current = marker;

    // Notify parent component
    if (notifyParent) {
      // Reverse geocode to get address (optional, can be done in parent)
      onLocationChange({
        lat,
        lng,
        address: location?.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
    }
  };

  return (
    <div className="map-wrapper">
      <div
        ref={mapContainerRef}
        style={{
          height,
          width: '100%',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-border)',
          overflow: 'hidden',
        }}
        className="map-container"
      />
      {!readOnly && (
        <div className="map-instructions">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              Click on the map or drag the pin to adjust location
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

// Static map preview for review step (non-interactive)
export const StaticMapPreview: React.FC<{ location: Location }> = ({
  location,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    L.marker([location.lat, location.lng]).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [location.lat, location.lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '200px',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    />
  );
};

export default MapDisplay;
