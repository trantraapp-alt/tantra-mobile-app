// Device-location service: asks permission, gets a coarse fix (bounded by a
// timeout so it can never hang), and reverse-geocodes it with the free OS
// geocoder. Every failure mode resolves to a typed status rather than throwing,
// so callers can degrade to manual / PIN entry.
import * as Location from 'expo-location';

import { logger } from '@/lib';

import type { LocationOutcome, ResolvedPlace } from '../types';

// Give up on a fresh GPS fix after this long and fall back.
const GPS_TIMEOUT_MS = 12000;

// A place with only coordinates known (geocoder gave nothing).
function coordsOnly(latitude: number, longitude: number): ResolvedPlace {
  return {
    village: '',
    district: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    fullAddress: '',
    latitude,
    longitude,
  };
}

// Maps an OS reverse-geocode result to a ResolvedPlace.
function fromGeocode(
  geo: Location.LocationGeocodedAddress,
  latitude: number,
  longitude: number,
): ResolvedPlace {
  return {
    village: geo.subregion ?? '',
    district: geo.district ?? geo.subregion ?? '',
    city: geo.city ?? '',
    state: geo.region ?? '',
    country: geo.country ?? '',
    pinCode: geo.postalCode ?? '',
    fullAddress: [geo.name, geo.street].filter(Boolean).join(', '),
    latitude,
    longitude,
  };
}

// Rejects if the promise does not settle within `ms`.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('location-timeout')), ms),
    ),
  ]);
}

// Requests the current device location and resolves it to an address. Returns a
// typed status; never throws.
export async function requestCurrentPlace(): Promise<LocationOutcome> {
  let permission: Location.LocationPermissionResponse;
  try {
    permission = await Location.requestForegroundPermissionsAsync();
  } catch (error) {
    logger.warn('[Location] permission request failed', error);
    return { status: 'unavailable' };
  }
  if (permission.status !== 'granted') {
    return { status: 'denied' };
  }

  // Location can be granted while the OS-level service is switched off.
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      return { status: 'unavailable' };
    }
  } catch {
    // If we cannot tell, continue and let the fix attempt decide.
  }

  let position: Location.LocationObject | null = null;
  try {
    position = await Location.getLastKnownPositionAsync();
    if (!position) {
      position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        GPS_TIMEOUT_MS,
      );
    }
  } catch (error) {
    logger.warn('[Location] position lookup failed', error);
    return { status: 'timeout' };
  }
  if (!position) {
    return { status: 'timeout' };
  }

  const { latitude, longitude } = position.coords;
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = results[0];
    return {
      status: 'granted',
      place: first
        ? fromGeocode(first, latitude, longitude)
        : coordsOnly(latitude, longitude),
    };
  } catch (error) {
    // No geocoder available (e.g. no Play Services) — return coords only.
    logger.warn('[Location] reverse geocode failed', error);
    return { status: 'granted', place: coordsOnly(latitude, longitude) };
  }
}
