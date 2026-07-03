import type { ConnectorType } from "../../models/model";
import i18n from "../../i18n";
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
    return {
      ok: false,
      error: i18n.t("client.backendNotConfigured", { ns: "api" }),
    };
  }
  if (!email) {
    return { ok: false, error: i18n.t("cars.emailRequired", { ns: "api" }) };
  }
  if (!userId) {
    return { ok: false, error: i18n.t("session.userMissing", { ns: "api" }) };
  }

  const battery = coerceBatteryCapacity(batteryCapacity);

  try {
    const response = await fetch(`${baseUrl}/vehicles/add-vehicle`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        email,
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
      return { ok: false, error: vehicle.message || i18n.t("cars.saveFailed", { ns: "api" }) };
    }

    persistActiveCarId(vehicle?.id);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : i18n.t("cars.saveFailed", { ns: "api" }),
    };
  }
}
