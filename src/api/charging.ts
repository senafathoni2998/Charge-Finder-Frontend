import type { ConnectorType } from "../models/model";
import i18n from "../i18n";
import { apiRequest } from "./client";

type ChargingRequestParams = {
  stationId: string;
  connectorType?: ConnectorType | null;
  vehicleId?: string | null;
  /** Optional "notify me at this battery %" threshold (1–99); null/omitted = off. */
  notifyAtPercent?: number | null;
  cancel?: boolean;
  signal?: AbortSignal;
};

type ChargingProgressParams = {
  stationId: string;
  progressPercent: number;
  signal?: AbortSignal;
};

type ChargingRequestResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type ChargingProgressResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type TicketResponse = {
  ticket?: Record<string, unknown> | null;
  completedTicket?: Record<string, unknown> | null;
  cancelledTicket?: Record<string, unknown> | null;
};

// Starts a charging session for the user's active ticket.
export const startChargingSession = async ({
  stationId,
  connectorType,
  vehicleId,
  notifyAtPercent,
  signal,
}: ChargingRequestParams): Promise<ChargingRequestResult> => {
  if (!stationId) {
    return { ok: false, error: i18n.t("stations.missing", { ns: "api" }) };
  }

  const payload: Record<string, unknown> = { stationId };
  if (connectorType) payload.connectorType = connectorType;
  if (vehicleId) payload.vehicleId = vehicleId;
  if (
    typeof notifyAtPercent === "number" &&
    Number.isFinite(notifyAtPercent) &&
    notifyAtPercent >= 1 &&
    notifyAtPercent <= 99
  ) {
    payload.notifyAtPercent = Math.round(notifyAtPercent);
  }

  const res = await apiRequest<TicketResponse>("/stations/start-charging", {
    method: "POST",
    body: payload,
    signal,
    fallbackError: i18n.t("charging.startFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true, ticket: res.data?.ticket ?? null };
};

// Updates charging progress for the user's active ticket.
export const updateChargingProgress = async ({
  stationId,
  progressPercent,
  signal,
}: ChargingProgressParams): Promise<ChargingProgressResult> => {
  if (!stationId) {
    return { ok: false, error: i18n.t("stations.missing", { ns: "api" }) };
  }

  if (!Number.isFinite(progressPercent)) {
    return { ok: false, error: i18n.t("charging.progressInvalid", { ns: "api" }) };
  }

  const res = await apiRequest<TicketResponse>("/stations/charging-progress", {
    method: "PATCH",
    body: { stationId, progressPercent },
    signal,
    fallbackError: i18n.t("charging.updateProgressFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true, ticket: res.data?.ticket ?? null };
};

// Completes the charging session and clears the active ticket.
export const completeChargingSession = async ({
  stationId,
  cancel,
  signal,
}: ChargingRequestParams): Promise<ChargingRequestResult> => {
  if (!stationId) {
    return { ok: false, error: i18n.t("stations.missing", { ns: "api" }) };
  }

  const payload = cancel ? { stationId, cancel: true } : { stationId };

  const res = await apiRequest<TicketResponse>("/stations/complete-charging", {
    method: "POST",
    body: payload,
    signal,
    fallbackError: i18n.t("charging.completeFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return {
    ok: true,
    ticket:
      res.data?.completedTicket ??
      res.data?.cancelledTicket ??
      res.data?.ticket ??
      null,
  };
};

// Cancels the charging session and keeps current progress.
export const cancelChargingSession = async ({
  stationId,
  signal,
}: ChargingRequestParams): Promise<ChargingRequestResult> => {
  if (!stationId) {
    return { ok: false, error: i18n.t("stations.missing", { ns: "api" }) };
  }

  const res = await apiRequest<TicketResponse>("/stations/cancel-charging", {
    method: "POST",
    body: { stationId },
    signal,
    fallbackError: i18n.t("charging.cancelFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true, ticket: res.data?.cancelledTicket ?? res.data?.ticket ?? null };
};
