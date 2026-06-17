import { useState, useEffect } from 'react';
import type { Location, LocationInputProps } from './types';
import { MapDisplay } from './MapDisplay';

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onError,
  placeholder = 'Enter address or site name (optional)',
}) => {
  const [address, setAddress] = useState(value?.address || '');
  const [isLocating, setIsLocating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync with external value
  useEffect(() => {
    if (value?.address) {
      setAddress(value.address);
    }
  }, [value?.address]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAddress(newValue);
    setLocalError(null);

    // If we already have coordinates, just update the address label
    if (value) {
      onChange({ ...value, address: newValue });
    }
  };

  const handleMapLocationChange = (location: Location) => {
    // When map marker changes, update the location but keep the address input
    const updatedLocation: Location = {
      ...location,
      address: address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
    };
    setLocalError(null);
    onChange(updatedLocation);
  };

  const handleGeolocation = () => {
    setIsLocating(true);
    setLocalError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: Location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          };
          setAddress(location.address);
          setIsLocating(false);
          setLocalError(null);
          onChange(location);
        },
        (err) => {
          setIsLocating(false);
          let errorMsg: string;

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'To use Location Helper, please allow location access in your browser settings. You can also type an address or place the pin manually on the map.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is not available right now. Please try typing an address or placing the pin manually.';
              break;
            case err.TIMEOUT:
              errorMsg = 'Taking longer than expected to find your location. You can type an address or place the pin manually instead.';
              break;
            default:
              errorMsg = 'Could not find your location. Please type an address or place the pin manually on the map.';
          }

          setLocalError(errorMsg);
          // Don't propagate geolocation errors to parent - they're already user-friendly
          // and shown inline
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      const errorMsg = 'Location Helper is not available on your device. Please type an address or place the pin manually on the map.';
      setIsLocating(false);
      setLocalError(errorMsg);
      // Don't propagate - shown inline
    }
  };

  return (
    <div className="w-full">
      <label className="form-label" htmlFor="location-address">
        Location / site address (optional)
      </label>

      {/* Address input with Location Helper button */}
      <div className="flex gap-2 mb-4">
        <input
          id="location-address"
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          className={`form-input flex-1${localError ? ' form-input--error' : ''}`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={isLocating}
          className="btn btn-secondary shrink-0"
          title="Find your current location"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
          }}
        >
          {isLocating ? (
            <>
              <span className="spinner" />
              <span className="hidden sm:inline">Finding...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              <span className="hidden sm:inline">Location Helper</span>
              <span className="sm:hidden">Helper</span>
            </>
          )}
        </button>
      </div>

      {/* Location Helper helper text */}
      <p
        className="text-sm mb-4"
        style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}
      >
        <strong>Tip:</strong> The Location Helper button finds where you are right now. 
        It works best when you are standing near the hose.
      </p>

      {/* No location selected hint */}
      {!value && !localError && (
        <div
          className="alert alert-info mb-4"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className="font-medium" style={{ fontSize: '0.9375rem' }}>
              To continue, please mark where the hose is on the map
            </p>
            <p className="mt-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Tap the Location Helper button, or tap directly on the map to place a pin. You can also drag the pin to adjust.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <div className="mb-4">
        <MapDisplay
          location={value}
          onLocationChange={handleMapLocationChange}
          height="280px"
        />
      </div>

      {/* Error message - only shown once here */}
      {localError && (
        <div
          className="alert alert-error"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{localError}</span>
        </div>
      )}

      {/* Location confirmation display */}
      {value && (
        <div className="info-box">
          <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Location set
          </strong>
          <p className="mt-1" style={{ fontSize: '0.875rem' }}>
            {value.address || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Coordinates: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
