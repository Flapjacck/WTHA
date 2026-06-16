import { useState } from 'react';
import type { Location, LocationInputProps } from './types';

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onError,
  placeholder = 'Enter address or site name',
}) => {
  const [address, setAddress] = useState(value?.address || '');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      const err = 'Please enter an address';
      setError(err);
      onError?.(err);
      return;
    }

    const mockLat = 40.7128 + Math.random() * 0.1;
    const mockLng = -74.006 + Math.random() * 0.1;

    const location: Location = {
      lat: mockLat,
      lng: mockLng,
      address,
    };
    onChange(location);
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          };
          setAddress(location.address);
          onChange(location);
          setError(null);
        },
        (err) => {
          const errorMsg = `Geolocation error: ${err.message}`;
          setError(errorMsg);
          onError?.(errorMsg);
        }
      );
    } else {
      const err = 'Geolocation not supported in your browser';
      setError(err);
      onError?.(err);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          Where did you find it?
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Enter the site address or use your current GPS location.
        </p>
      </div>

      <label className="form-label" htmlFor="location-address">
        Location / site address
      </label>
      <div className="flex gap-2 mb-3">
        <input
          id="location-address"
          type="text"
          value={address}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`form-input flex-1${error ? ' form-input--error' : ''}`}
        />
        <button
          type="button"
          onClick={handleGeolocation}
          className="btn btn-secondary btn-icon shrink-0"
          title="Use current location"
          aria-label="Use current location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="btn btn-primary w-full"
      >
        Confirm location
      </button>

      {error && (
        <p className="text-sm mt-2" style={{ color: 'var(--color-accent)' }}>{error}</p>
      )}

      {value && (
        <div className="info-box mt-4">
          <strong>Location confirmed</strong>
          <p className="mt-0.5">{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
};
