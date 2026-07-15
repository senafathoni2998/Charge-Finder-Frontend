// Persists the last successfully-loaded "nearby stations" result so the map can
// show something useful while offline or when the backend is unreachable. This is
// the app-level half of offline support; the service worker's runtime cache is the
// transparent half. Keeping a copy here also gives us the "saved N min ago"
// timestamp the offline banner shows, and survives coordinate drift the SW's
// URL-keyed cache would miss.

import type { Station } from "../models/model";

const STORAGE_KEY = "cf_nearby_stations_v1";
// The nearby endpoint already caps results (~300); mirror that so a snapshot can't
// blow the localStorage quota.
const MAX_STATIONS = 300;
// Beyond a day, "last-known" stations are too stale to present as current.
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type LatLng = { lat: number; lng: number };

export type NearbyStationsSnapshot = {
  stations: Station[];
  center: LatLng;
  radiusKm: number;
  savedAt: number; // epoch ms
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isSnapshot = (value: unknown): value is NearbyStationsSnapshot => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const center = v.center as Record<string, unknown> | undefined;
  return (
    Array.isArray(v.stations) &&
    isFiniteNumber(v.savedAt) &&
    !!center &&
    isFiniteNumber(center.lat) &&
    isFiniteNumber(center.lng)
  );
};

/**
 * Stores the latest nearby-stations result. No-ops on an empty list so a genuine
 * "nothing nearby" or a failed request can never clobber a good prior snapshot.
 */
export const saveNearbyStations = (
  center: LatLng,
  radiusKm: number,
  stations: Station[],
): void => {
  if (typeof window === "undefined") return;
  if (!Array.isArray(stations) || stations.length === 0) return;
  if (!center || !isFiniteNumber(center.lat) || !isFiniteNumber(center.lng)) {
    return;
  }

  const snapshot: NearbyStationsSnapshot = {
    // Strip the per-user `isChargingHere` flag before persisting. This snapshot
    // lives in one shared, unpartitioned localStorage key, so keeping an account's
    // live charging state would leak it into the next session on a shared device —
    // and "am I charging here" is meaningless for offline last-known data anyway.
    stations: stations.slice(0, MAX_STATIONS).map((station) => {
      const { isChargingHere: _omit, ...rest } = station;
      void _omit;
      return rest as Station;
    }),
    center: { lat: center.lat, lng: center.lng },
    radiusKm: isFiniteNumber(radiusKm) ? radiusKm : 0,
    savedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota exceeded or storage disabled — the offline cache is best-effort.
  }
};

/**
 * Returns the last saved snapshot, or null when absent, unparseable, malformed,
 * or older than `maxAgeMs` (pass 0 to ignore age).
 */
export const loadNearbyStations = (
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): NearbyStationsSnapshot | null => {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isSnapshot(parsed)) return null;
  if (maxAgeMs > 0 && Date.now() - parsed.savedAt > maxAgeMs) return null;
  return parsed;
};

export const clearNearbyStations = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Deletes the service worker's cached nearby-stations responses (the `cf-stations-*`
 * caches). Call this on logout so a signed-in user's personalized `/stations`
 * response — which carries per-user flags — can never be served to the next
 * account while offline. No-ops where CacheStorage is unavailable.
 */
export const clearOfflineStationCaches = async (): Promise<void> => {
  if (typeof caches === "undefined") return;
  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith("cf-stations-"))
        .map((name) => caches.delete(name)),
    );
  } catch {
    // best-effort — offline cache cleanup must never break logout.
  }
};
