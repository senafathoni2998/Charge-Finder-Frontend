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
    return { ok: false, vehicle: null, error: "Vehicle is missing." };
  }

  const res = await apiRequest<{ vehicle?: Record<string, unknown> } | null>(
    `/vehicles/${encodeURIComponent(vehicleId)}`,
    { method: "GET", signal, fallbackError: "Could not load vehicle." }
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
    return { ok: false, vehicle: null, error: "Vehicle not found." };
  }

  return { ok: true, vehicle: vehicle as Record<string, unknown> };
};
