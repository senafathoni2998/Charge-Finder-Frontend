import type { ConnectorType } from "../../models/model";
import {
  coerceBatteryCapacity,
  type CarRequestResult,
} from "../AddCar/addCarRoute";

/**
 * Updates a vehicle. Connector validation is handled by the form via
 * zodResolver(carFormSchema); navigation is the caller's responsibility.
 */
export async function editCarRequest({
  vehicleId,
  userId,
  name,
  connectorTypes,
  minKW,
  batteryCapacity,
}: {
  vehicleId: string;
  userId: string;
  name: string;
  connectorTypes: ConnectorType[];
  minKW: number;
  batteryCapacity: string;
}): Promise<CarRequestResult> {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }
  if (!vehicleId) {
    return { ok: false, error: "Vehicle is missing." };
  }
  if (!userId) {
    return { ok: false, error: "User session is missing." };
  }

  const battery = coerceBatteryCapacity(batteryCapacity);

  try {
    const response = await fetch(`${baseUrl}/vehicles/update-vehicle`, {
      method: "PATCH",
      body: JSON.stringify({
        vehicleId,
        userId,
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
      return { ok: false, error: vehicle.message || "Could not update car." };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update car.",
    };
  }
}
