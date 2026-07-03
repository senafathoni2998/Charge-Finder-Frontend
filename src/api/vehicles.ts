import i18n from "../i18n";
import { apiRequest } from "./client";

type FetchVehicleResult = {
  ok: boolean;
  vehicle: Record<string, unknown> | null;
  error?: string;
};

// Loads a single vehicle by id.
export const fetchVehicleById = async (
  vehicleId: string,
  signal?: AbortSignal
): Promise<FetchVehicleResult> => {
  if (!vehicleId) {
    return {
      ok: false,
      vehicle: null,
      error: i18n.t("vehicles.missing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{ vehicle?: Record<string, unknown> } | null>(
    `/vehicles/${encodeURIComponent(vehicleId)}`,
    {
      method: "GET",
      signal,
      fallbackError: i18n.t("vehicles.loadFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, vehicle: null, error: res.error };
  }

  const data = res.data;
  const vehicle =
    data && typeof data === "object"
      ? (data as { vehicle?: Record<string, unknown> }).vehicle ?? data
      : null;
  if (!vehicle || typeof vehicle !== "object") {
    return {
      ok: false,
      vehicle: null,
      error: i18n.t("vehicles.notFound", { ns: "api" }),
    };
  }

  return { ok: true, vehicle: vehicle as Record<string, unknown> };
};
