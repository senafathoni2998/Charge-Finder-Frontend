import { Availability, Connector, Station } from "../models/model";
import {
  StationFilters,
  StationWithDistance,
} from "../pages/MainPage/types";

export function statusLabel(status: Availability) {
  if (status === "AVAILABLE") return "Available";
  if (status === "BUSY") return "Busy";
  return "Offline";
}

export function formatCurrency(currency: string, value?: number) {
  if (!value && value !== 0) return "—";
  // Keep formatting simple & stable across runtimes.
  return `${currency} ${value.toLocaleString("en-US")}`;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

const DEFAULT_MAP_CENTER = { lat: -6.2, lng: 106.8167 };
const DEFAULT_LAT_SPAN = 0.35;
const DEFAULT_LNG_SPAN = 0.45;

export function boundsFromStations(
  stations: Array<{ lat: number; lng: number }>
) {
  const coords = stations
    .map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) }))
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng)
    );

  if (!coords.length) {
    const minLat = DEFAULT_MAP_CENTER.lat - DEFAULT_LAT_SPAN / 2;
    const maxLat = DEFAULT_MAP_CENTER.lat + DEFAULT_LAT_SPAN / 2;
    const minLng = DEFAULT_MAP_CENTER.lng - DEFAULT_LNG_SPAN / 2;
    const maxLng = DEFAULT_MAP_CENTER.lng + DEFAULT_LNG_SPAN / 2;
    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      latSpan: DEFAULT_LAT_SPAN,
      lngSpan: DEFAULT_LNG_SPAN,
    };
  }

  const lats = coords.map((s) => s.lat);
  const lngs = coords.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // avoid 0 span
  const latSpan = Math.max(0.00001, maxLat - minLat);
  const lngSpan = Math.max(0.00001, maxLng - minLng);
  return { minLat, maxLat, minLng, maxLng, latSpan, lngSpan };
}

export function filterStations(
  stations: Station[],
  filters: StationFilters,
  userCenter: { lat: number; lng: number }
): StationWithDistance[] {
  const lower = filters.q.toLowerCase();
  const maxDistanceKm = Number.isFinite(filters.radiusKm)
    ? Number(filters.radiusKm)
    : 0;
  return stations
    .map((s) => {
      const distanceKm = haversineKm(userCenter, { lat: s.lat, lng: s.lng });
      return { ...s, distanceKm };
    })
    .filter((s) => {
      // Always show stations where user is currently charging
      if (s.isChargingHere) return true;

      const matchesQ = !filters.q
        ? true
        : s.name.toLowerCase().includes(lower) ||
          s.address.toLowerCase().includes(lower);

      const matchesStatus = !filters.status
        ? true
        : s.status === filters.status;

      const matchesConnector = filters.connectorSet.size
        ? s.connectors.some((c: Connector) => filters.connectorSet.has(c.type))
        : true;

      const matchesMinKw = filters.minKW
        ? s.connectors.some((c: Connector) => c.powerKW >= filters.minKW)
        : true;

      const matchesDistance = maxDistanceKm
        ? s.distanceKm <= maxDistanceKm
        : true;

      return (
        matchesQ &&
        matchesStatus &&
        matchesConnector &&
        matchesMinKw &&
        matchesDistance
      );
    })
    .sort((a, b) => {
      // Priority: charging > available > busy > offline
      const getStatusPriority = (station: StationWithDistance) => {
        if (station.isChargingHere) return 0;
        if (station.status === "AVAILABLE") return 1;
        if (station.status === "BUSY") return 2;
        return 3; // OFFLINE or unknown
      };

      const priorityDelta = getStatusPriority(a) - getStatusPriority(b);
      if (priorityDelta !== 0) return priorityDelta;

      // Within same priority, sort by distance
      return a.distanceKm - b.distanceKm;
    });
}
