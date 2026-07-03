import type { ChargingStatus, Ticket } from "./types";
import type { ChargingSpeed } from "../../models/model";

// Pure parsing/normalization helpers for the station-detail charging flow.
// Extracted from index.tsx so they can be unit-tested in isolation.

export const toCleanString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

export const toChargingStatus = (value: unknown): ChargingStatus | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "charging") return "charging";
  if (normalized === "done" || normalized === "completed") return "done";
  if (normalized === "idle") return "idle";
  return null;
};

export const toProgressPercent = (value: unknown): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
};

export const toChargingSpeed = (value: unknown): ChargingSpeed | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (normalized === "NORMAL") return "NORMAL";
  if (normalized === "FAST") return "FAST";
  if (normalized === "ULTRA_FAST" || normalized === "ULTRAFAST") {
    return "ULTRA_FAST";
  }
  return null;
};

export const toDateMs = (value: unknown): number | null => {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value > 1e12 ? value : value * 1000;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
};

export const isVehicleCharging = (vehicle: {
  chargingStatus?: string | null;
}) =>
  typeof vehicle.chargingStatus === "string" &&
  vehicle.chargingStatus.trim().toUpperCase() === "CHARGING";

// Builds the WebSocket URL for charging progress updates.
export const buildChargingSocketUrl = (stationId: string): string | null => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  const query = `stationId=${encodeURIComponent(stationId)}`;

  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      const protocol = url.protocol === "https:" ? "wss" : "ws";
      return `${protocol}://${url.host}/ws/charging-progress?${query}`;
    } catch {
      return null;
    }
  }

  if (typeof window === "undefined") return null;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/charging-progress?${query}`;
};

export const buildTicketFromServer = (
  payload: Record<string, unknown>,
  priceLabel: string,
  accountLabel = "ChargeFinder account"
): Ticket => {
  const ticketId =
    toCleanString(payload.id ?? payload._id) || `TICKET-${Date.now()}`;
  const status = toCleanString(payload.status).toUpperCase();
  const purchasedAt =
    typeof payload.createdAt === "string"
      ? payload.createdAt
      : new Date().toISOString();
  const methodLabel = accountLabel;
  const chargingStatus =
    toChargingStatus(payload.chargingStatus) ??
    toChargingStatus(payload.charging_state) ??
    null;
  const progressPercent =
    toProgressPercent(payload.progressPercent) ??
    toProgressPercent(payload.progress_percent) ??
    null;
  const chargingStartedAt =
    typeof payload.chargingStartedAt === "string"
      ? payload.chargingStartedAt
      : typeof payload.charging_started_at === "string"
      ? payload.charging_started_at
      : undefined;
  const chargingUpdatedAt =
    typeof payload.chargingUpdatedAt === "string"
      ? payload.chargingUpdatedAt
      : typeof payload.charging_updated_at === "string"
      ? payload.charging_updated_at
      : undefined;
  const chargingCompletedAt =
    typeof payload.chargingCompletedAt === "string"
      ? payload.chargingCompletedAt
      : typeof payload.charging_completed_at === "string"
      ? payload.charging_completed_at
      : undefined;

  return {
    id: ticketId,
    methodId: status ? status.toLowerCase() : "ticket",
    methodLabel,
    priceLabel,
    purchasedAt,
    chargingStatus: chargingStatus ?? undefined,
    progressPercent: progressPercent ?? undefined,
    chargingStartedAt,
    chargingUpdatedAt,
    chargingCompletedAt,
  };
};
