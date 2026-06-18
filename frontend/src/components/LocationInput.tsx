import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { Location, LocationInputProps } from './types';
import { MapDisplay } from './MapDisplay';
import { geocodeAddress, reverseGeocodeAddress } from '../lib/geocoding';

export interface LocationInputRef {
  resolveLocation: () => Promise<Location | null>;
}

export const LocationInput = forwardRef<LocationInputRef, LocationInputProps>(
  function LocationInput(
    {
      value,
      onChange,
      onError,
      onGeocodingChange,
      placeholder = 'Enter street address or site name',
    },
    ref
  ) {
    const [address, setAddress] = useState(value?.address || '');
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const skipGeocodeRef = useRef(false);
    const lastGeocodedAddressRef = useRef<string | null>(null);

    useEffect(() => {
      if (value?.address) {
        setAddress(value.address);
      }
    }, [value?.address]);

    useEffect(() => {
      onGeocodingChange?.(isGeocoding || isLocating);
    }, [isGeocoding, isLocating, onGeocodingChange]);

    const applyLocation = (location: Location, fromMap = false) => {
      if (fromMap) {
        skipGeocodeRef.current = true;
      }
      onChange(location);
    };

    const geocodeAndApply = async (rawAddress: string): Promise<Location | null> => {
      const trimmed = rawAddress.trim();
      if (trimmed.length < 3) return null;

      setIsGeocoding(true);
      try {
        const result = await geocodeAddress(trimmed);
        if (!result) return null;

        const location: Location = {
          lat: result.lat,
          lng: result.lng,
          address: trimmed,
        };
        lastGeocodedAddressRef.current = trimmed.toLowerCase();
        skipGeocodeRef.current = true;
        onChange(location);
        return location;
      } finally {
        setIsGeocoding(false);
      }
    };

    useImperativeHandle(ref, () => ({
      resolveLocation: async () => {
        const trimmed = address.trim();
        if (!trimmed) {
          onError?.('Please enter a location or site address');
          return null;
        }

        if (
          value &&
          value.address.trim().toLowerCase() === trimmed.toLowerCase() &&
          Number.isFinite(value.lat) &&
          Number.isFinite(value.lng)
        ) {
          return value;
        }

        setIsGeocoding(true);
        try {
          const result = await geocodeAddress(trimmed);
          if (!result) {
            onError?.(
              'Could not find that address. Try Location Helper or place a pin on the map.'
            );
            return null;
          }

          const location: Location = {
            lat: result.lat,
            lng: result.lng,
            address: trimmed,
          };
          lastGeocodedAddressRef.current = trimmed.toLowerCase();
          skipGeocodeRef.current = true;
          onChange(location);
          return location;
        } finally {
          setIsGeocoding(false);
        }
      },
    }));

    useEffect(() => {
      const trimmed = address.trim();
      if (trimmed.length < 3) return;

      if (skipGeocodeRef.current) {
        skipGeocodeRef.current = false;
        return;
      }

      if (lastGeocodedAddressRef.current === trimmed.toLowerCase()) {
        return;
      }

      const timer = window.setTimeout(() => {
        void geocodeAndApply(trimmed);
      }, 800);

      return () => window.clearTimeout(timer);
    }, [address]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setAddress(newValue);
      lastGeocodedAddressRef.current = null;

      if (value) {
        applyLocation({ ...value, address: newValue });
      }
    };

    const handleMapLocationChange = (location: Location) => {
      const updatedLocation: Location = {
        ...location,
        address: address.trim() || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
      };
      applyLocation(updatedLocation, true);
    };

    const handleGeolocation = () => {
      setIsLocating(true);

      if (!('geolocation' in navigator)) {
        setIsLocating(false);
        onError?.(
          'Location Helper is not available on your device. Please type an address or place the pin manually on the map.'
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setIsGeocoding(true);
          try {
            const resolvedAddress =
              (await reverseGeocodeAddress(latitude, longitude)) ??
              `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: resolvedAddress,
            };

            setAddress(resolvedAddress);
            lastGeocodedAddressRef.current = resolvedAddress.toLowerCase();
            skipGeocodeRef.current = true;
            onChange(location);
          } finally {
            setIsGeocoding(false);
            setIsLocating(false);
          }
        },
        (err) => {
          setIsLocating(false);
          let errorMsg: string;

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg =
                'To use Location Helper, please allow location access in your browser settings. You can also type an address or place the pin manually on the map.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg =
                'Location information is not available right now. Please try typing an address or placing the pin manually.';
              break;
            case err.TIMEOUT:
              errorMsg =
                'Taking longer than expected to find your location. You can type an address or place the pin manually instead.';
              break;
            default:
              errorMsg =
                'Could not find your location. Please type an address or place the pin manually on the map.';
          }

          onError?.(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    return (
      <div className="w-full">
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={isLocating || isGeocoding}
          className="btn btn-secondary location-helper-btn w-full mb-5"
          title="Find your current location"
        >
          {isLocating ? (
            <>
              <span className="spinner location-helper-btn__spinner" />
              <span>Finding your location…</span>
            </>
          ) : (
            <>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              <span>Use Location Helper</span>
            </>
          )}
        </button>

        <label className="form-label" htmlFor="location-address">
          Location / site address <span className="form-label__required">*</span>
        </label>

        <input
          id="location-address"
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          className="form-input mb-4"
          autoComplete="street-address"
          required
        />

        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}
        >
          <strong>Tip:</strong> Location Helper works best when you are standing near the hose.
          You can also type an address — the map will update so you can confirm it is correct.
        </p>

        {!value && !isGeocoding && (
          <div className="alert alert-info mb-4 location-info-alert">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="font-medium" style={{ fontSize: '0.9375rem' }}>
                Enter an address or use Location Helper
              </p>
              <p className="mt-1" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                The map will show where your address points to. You can tap the map or drag the pin
                to fine-tune the spot.
              </p>
            </div>
          </div>
        )}

        {isGeocoding && (
          <div className="alert alert-info mb-4 location-info-alert">
            <span className="spinner" />
            <span>Looking up address on the map…</span>
          </div>
        )}

        <div className="mb-4">
          <MapDisplay
            location={value}
            onLocationChange={handleMapLocationChange}
            height="280px"
          />
        </div>

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
                aria-hidden
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
  }
);

export default LocationInput;
