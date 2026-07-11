import type { ConnectorType } from "../models/model";
import i18n from "../i18n";
import { apiRequest } from "./client";

// --- Types (mirror the backend trip-planner payloads) ---

export type TripPoint = { lat: number; lng: number; label?: string };

export type PlanStop = {
  station: { id: string; name?: string; address?: string; lat: number; lng: number };
  connectorType: string;
  powerKW: number;
  distanceFromPrevKm: number;
  cumulativeKm: number;
  detourKm: number;
  arrivalBatteryPercent: number;
  departBatteryPercent: number;
};

export type PlanLeg = {
  from: TripPoint & { label: string };
  to: TripPoint & { label: string };
  distanceKm: number;
  arrivalBatteryPercent: number;
};

export type TripParams = {
  fullRangeKm: number;
  startBatteryPercent: number;
  bufferPercent: number;
  chargeToPercent: number;
  minPowerKW: number;
  maxDetourKm: number;
  allowedConnectorTypes: string[];
  efficiencyKwhPer100Km: number;
};

export type TripPlan = {
  feasible: boolean;
  reason?: string;
  origin: TripPoint;
  destination: TripPoint;
  vehicleId?: string;
  params: TripParams;
  directDistanceKm: number;
  totalDistanceKm: number;
  totalStops: number;
  reserveKm: number;
  usableStartKm: number;
  perStopUsableKm: number;
  stops: PlanStop[];
  legs: PlanLeg[];
};

// A saved trip's stops are stored FLAT (name/lat/lng at the top level; `station` is
// an id or absent) — unlike a fresh plan's nested `station` object.
export type SavedTripStop = {
  station?: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  connectorType?: string;
  powerKW?: number;
  distanceFromPrevKm?: number;
  cumulativeKm?: number;
  arrivalBatteryPercent?: number;
  departBatteryPercent?: number;
};

export type SavedTrip = {
  id: string;
  user: string;
  vehicle?: string;
  name?: string;
  origin: TripPoint;
  destination: TripPoint;
  fullRangeKm: number;
  startBatteryPercent?: number;
  bufferPercent?: number;
  chargeToPercent?: number;
  minPowerKW?: number;
  maxDetourKm?: number;
  allowedConnectorTypes: string[];
  feasible: boolean;
  directDistanceKm?: number;
  totalDistanceKm?: number;
  totalStops: number;
  stops: SavedTripStop[];
  createdAt: string;
  updatedAt: string;
};

// The planning inputs the form submits. Only origin + destination are required;
// everything else is optional (the backend fills defaults, incl. from a vehicle).
export type PlanInput = {
  origin: TripPoint;
  destination: TripPoint;
  vehicleId?: string;
  rangeKm?: number;
  startBatteryPercent?: number;
  bufferPercent?: number;
  chargeToPercent?: number;
  minPowerKW?: number;
  maxDetourKm?: number;
  connectorTypes?: ConnectorType[];
  efficiencyKwhPer100Km?: number;
};

// A single stop shape both a fresh plan and a saved trip normalize to, so the UI can
// render either uniformly.
export type NormalizedStop = {
  name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  connectorType: string | null;
  powerKW: number | null;
  distanceFromPrevKm: number | null;
  cumulativeKm: number | null;
  arrivalBatteryPercent: number | null;
  departBatteryPercent: number | null;
};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v : null;

export const normalizeStop = (stop: PlanStop | SavedTripStop): NormalizedStop => {
  const station = (stop as PlanStop).station;
  const nested = station && typeof station === "object";
  const flat = stop as SavedTripStop;
  return {
    name: nested ? str(station.name) : str(flat.name),
    address: nested ? str(station.address) : str(flat.address),
    lat: nested ? num(station.lat) : num(flat.lat),
    lng: nested ? num(station.lng) : num(flat.lng),
    connectorType: str(stop.connectorType),
    powerKW: num(stop.powerKW),
    distanceFromPrevKm: num(stop.distanceFromPrevKm),
    cumulativeKm: num(stop.cumulativeKm),
    arrivalBatteryPercent: num(stop.arrivalBatteryPercent),
    departBatteryPercent: num(stop.departBatteryPercent),
  };
};

// --- API ---

type PlanResult = { ok: boolean; plan: TripPlan | null; error?: string };
type SaveResult = {
  ok: boolean;
  trip: SavedTrip | null;
  plan: TripPlan | null;
  error?: string;
};
type TripsResult = { ok: boolean; trips: SavedTrip[]; error?: string };
type DeleteResult = { ok: boolean; error?: string };

// Only the meaningful, finite fields are sent, so blank optional inputs fall back to
// the backend/vehicle defaults instead of overriding them with empty values.
const buildBody = (input: PlanInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    origin: { lat: input.origin.lat, lng: input.origin.lng, ...(input.origin.label ? { label: input.origin.label } : {}) },
    destination: {
      lat: input.destination.lat,
      lng: input.destination.lng,
      ...(input.destination.label ? { label: input.destination.label } : {}),
    },
  };
  if (input.vehicleId) body.vehicleId = input.vehicleId;
  const numericKeys: (keyof PlanInput)[] = [
    "rangeKm",
    "startBatteryPercent",
    "bufferPercent",
    "chargeToPercent",
    "minPowerKW",
    "maxDetourKm",
    "efficiencyKwhPer100Km",
  ];
  for (const key of numericKeys) {
    const value = input[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      body[key] = value;
    }
  }
  if (Array.isArray(input.connectorTypes) && input.connectorTypes.length > 0) {
    body.connectorTypes = input.connectorTypes;
  }
  return body;
};

// Computes a stateless range-aware plan.
export const planTrip = async (
  input: PlanInput,
  signal?: AbortSignal
): Promise<PlanResult> => {
  const res = await apiRequest<{ plan?: TripPlan }>("/trips/plan", {
    method: "POST",
    body: buildBody(input),
    signal,
    fallbackError: i18n.t("trips.planFailed", { ns: "api" }),
  });
  if (!res.ok) return { ok: false, plan: null, error: res.error };
  return { ok: true, plan: res.data?.plan ?? null };
};

// Computes and saves a (feasible) plan under an optional name.
export const saveTrip = async (
  input: PlanInput & { name?: string },
  signal?: AbortSignal
): Promise<SaveResult> => {
  const body = buildBody(input);
  if (input.name && input.name.trim()) body.name = input.name.trim();
  const res = await apiRequest<{ trip?: SavedTrip; plan?: TripPlan }>("/trips", {
    method: "POST",
    body,
    signal,
    fallbackError: i18n.t("trips.saveFailed", { ns: "api" }),
  });
  if (!res.ok) return { ok: false, trip: null, plan: null, error: res.error };
  return { ok: true, trip: res.data?.trip ?? null, plan: res.data?.plan ?? null };
};

// Lists the caller's saved trips, newest first.
export const fetchMyTrips = async (signal?: AbortSignal): Promise<TripsResult> => {
  const res = await apiRequest<{ trips?: SavedTrip[] }>("/trips", {
    method: "GET",
    signal,
    fallbackError: i18n.t("trips.loadFailed", { ns: "api" }),
  });
  if (!res.ok) return { ok: false, trips: [], error: res.error };
  return { ok: true, trips: Array.isArray(res.data?.trips) ? res.data.trips : [] };
};

// Deletes a saved trip.
export const deleteTrip = async (
  tripId: string,
  signal?: AbortSignal
): Promise<DeleteResult> => {
  if (!tripId) {
    return { ok: false, error: i18n.t("trips.idMissing", { ns: "api" }) };
  }
  const res = await apiRequest(`/trips/${encodeURIComponent(tripId)}`, {
    method: "DELETE",
    signal,
    fallbackError: i18n.t("trips.deleteFailed", { ns: "api" }),
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
};
