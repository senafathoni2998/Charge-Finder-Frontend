import type { ConnectorType } from "../../models/model";
import i18n from "../../i18n";
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
    return {
      ok: false,
      error: i18n.t("client.backendNotConfigured", { ns: "api" }),
    };
  }
  if (!vehicleId) {
    return { ok: false, error: i18n.t("vehicles.missing", { ns: "api" }) };
  }
  if (!userId) {
    return { ok: false, error: i18n.t("session.userMissing", { ns: "api" }) };
  }

  const battery = coerceBatteryCapacity(batteryCapacity);

  try {
    const response = await fetch(`${baseUrl}/vehicles/update-vehicle`, {
      method: "PATCH",
      body: JSON.stringify({
        vehicleId,
        userId,
        name: name.trim() || i18n.t("cars.defaultName", { ns: "api" }),
        connector_type: connectorTypes,
        min_power: minKW,
        ...(battery != null ? { batteryCapacity: battery } : {}),
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const vehicle = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: vehicle.message || i18n.t("cars.updateFailed", { ns: "api" }) };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : i18n.t("cars.updateFailed", { ns: "api" }),
    };
  }
}
