import type { ChargingSpeed, ConnectorType } from "../models/model";
import { apiRequest } from "./client";

type RequestChargingTicketParams = {
  stationId: string;
  connectorType?: ConnectorType;
  chargingSpeed?: ChargingSpeed;
  ticketKwh?: number;
  signal?: AbortSignal;
};

type RequestChargingTicketResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type FetchActiveTicketResult = {
  ok: boolean;
  ticket?: Record<string, unknown> | null;
  error?: string;
};

type TicketResponse = { ticket?: Record<string, unknown> | null };

export const requestChargingTicket = async ({
  stationId,
  connectorType,
  chargingSpeed,
  ticketKwh,
  signal,
}: RequestChargingTicketParams): Promise<RequestChargingTicketResult> => {
  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  const payload: {
    stationId: string;
    connectorType?: ConnectorType;
    chargingSpeed?: ChargingSpeed;
    ticketKwh?: number;
  } = { stationId };
  if (connectorType) {
    payload.connectorType = connectorType;
  }
  if (chargingSpeed) {
    payload.chargingSpeed = chargingSpeed;
  }
  if (Number.isFinite(ticketKwh)) {
    payload.ticketKwh = Number(ticketKwh);
  }

  const res = await apiRequest<TicketResponse>("/stations/request-ticket", {
    method: "POST",
    body: payload,
    signal,
    fallbackError: "Could not request ticket.",
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true, ticket: res.data?.ticket ?? null };
};

export const fetchActiveTicketForStation = async (
  stationId: string,
  signal?: AbortSignal
): Promise<FetchActiveTicketResult> => {
  if (!stationId) {
    return { ok: false, error: "Station is missing." };
  }

  const res = await apiRequest<TicketResponse>(
    `/stations/${stationId}/active-ticket`,
    { method: "GET", signal, fallbackError: "Could not load active ticket." }
  );
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true, ticket: res.data?.ticket ?? null };
};
