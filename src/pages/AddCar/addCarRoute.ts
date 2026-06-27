import type { ConnectorType } from "../../models/model";
import { persistActiveCarId } from "./addCarStorage";

export type CarRequestResult = { ok: true } | { ok: false; error: string };

// Mirrors the legacy action's batteryCapacity handling: a non-empty numeric
// string -> number, anything else -> null.
export const coerceBatteryCapacity = (raw: string): number | null => {
  const value = raw.trim() ? Number(raw) : null;
  return Number.isFinite(value) ? value : null;
};

/**
 * Creates a vehicle. Connector validation is handled by the form via
 * zodResolver(carFormSchema); navigation is the caller's responsibility.
 */
export async function createCarRequest({
  userId,
  email,
  name,
  connectorTypes,
  minKW,
  batteryCapacity,
}: {
  userId: string;
  email: string;
  name: string;
  connectorTypes: ConnectorType[];
  minKW: number;
  batteryCapacity: string;
}): Promise<CarRequestResult> {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }
  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (!userId) {
    return { ok: false, error: "User session is missing." };
  }

  const battery = coerceBatteryCapacity(batteryCapacity);

  try {
    const response = await fetch(`${baseUrl}/vehicles/add-vehicle`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        email,
        name: name.trim() || "My EV",
        connector_type: connectorTypes,
        min_power: minKW,
        ...(battery != null ? { batteryCapacity: battery } : {}),
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const vehicle = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: vehicle.message || "Could not save car." };
    }

    persistActiveCarId(vehicle?.id);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save car.",
    };
  }
}
