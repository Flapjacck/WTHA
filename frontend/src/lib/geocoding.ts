const reverseCache = new Map<string, string>();
const reversePending = new Map<string, Promise<string>>();
const fullAddressPending = new Map<string, Promise<string | null>>();
const forwardCache = new Map<string, GeocodeResult>();
const forwardPending = new Map<string, Promise<GeocodeResult | null>>();
let lastRequestAt = 0;

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
}

interface NominatimReverseResponse {
  display_name?: string;
  address?: NominatimAddress;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function addressKey(address: string): string {
  return address.trim().toLowerCase();
}

function formatCityLabel(address: NominatimAddress): string {
  const place =
    address.city ?? address.town ?? address.village ?? address.county ?? 'Unknown location';
  return address.state ? `${place}, ${address.state}` : place;
}

async function throttle(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestAt = Date.now();
}

async function nominatimFetch(url: URL): Promise<Response> {
  await throttle();
  return fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WTHA-HoseTracker/1.0',
    },
  });
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = address.trim();
  if (query.length < 3) return null;

  const key = addressKey(query);
  const cached = forwardCache.get(key);
  if (cached) return cached;

  const inFlight = forwardPending.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const response = await nominatimFetch(url);
    if (!response.ok) {
      throw new Error('Failed to geocode address');
    }

    const data = (await response.json()) as NominatimSearchResult[];
    if (!data.length) return null;

    const result: GeocodeResult = {
      lat: Number.parseFloat(data[0].lat),
      lng: Number.parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };

    forwardCache.set(key, result);
    forwardPending.delete(key);
    return result;
  })().catch(() => {
    forwardPending.delete(key);
    return null;
  });

  forwardPending.set(key, promise);
  return promise;
}

export async function reverseGeocodeAddress(lat: number, lng: number): Promise<string | null> {
  const key = coordKey(lat, lng);
  const cached = reverseCache.get(key);
  if (cached) return cached;

  const inFlight = fullAddressPending.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');

    const response = await nominatimFetch(url);
    if (!response.ok) {
      throw new Error('Failed to resolve location');
    }

    const data = (await response.json()) as NominatimReverseResponse;
    const label = data.display_name ?? null;
    if (label) reverseCache.set(key, label);
    fullAddressPending.delete(key);
    return label;
  })().catch(() => {
    fullAddressPending.delete(key);
    return null;
  });

  fullAddressPending.set(key, promise);
  return promise;
}

export async function reverseGeocodeCity(lat: number, lng: number): Promise<string> {
  const key = `city:${coordKey(lat, lng)}`;
  const cached = reverseCache.get(key);
  if (cached) return cached;

  const inFlight = reversePending.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');

    const response = await nominatimFetch(url);
    if (!response.ok) {
      throw new Error('Failed to resolve location');
    }

    const data = (await response.json()) as NominatimReverseResponse;
    const label = data.address ? formatCityLabel(data.address) : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    reverseCache.set(key, label);
    reversePending.delete(key);
    return label;
  })().catch(() => {
    reversePending.delete(key);
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    reverseCache.set(key, fallback);
    return fallback;
  });

  reversePending.set(key, promise);
  return promise;
}
