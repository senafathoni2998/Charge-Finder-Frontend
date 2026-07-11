import type {
  Availability,
  ConnectorType,
  StationPricing,
  StationPhoto,
} from "../../models/model";
import type {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../../forms/schemas";

type StationConnectorPayload = {
  type: ConnectorType;
  powerKW: number;
  ports: number;
  availablePorts: number;
};

export type StationFormPayload = {
  name: string;
  address: string;
  status: Availability;
  lat: number;
  lng: number;
  connectors: StationConnectorPayload[];
  pricing: StationPricing;
  amenities: string[];
  photos: StationPhoto[];
  notes?: string | null;
  lastUpdatedISO: string;
};

const DEFAULT_MAP_CENTER = { lat: -6.2, lng: 106.8167 };
const VALID_CONNECTORS = new Set<ConnectorType>(["CCS2", "Type2", "CHAdeMO"]);

// Generates a unique id for a draft connector/photo row (React key + array item).
export const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Builds a default connector draft with starter values.
export const createDefaultConnector = (
  connectorType: ConnectorType
): StationConnectorDraft => ({
  id: makeId("connector"),
  type: connectorType,
  powerKW: "50",
  ports: "2",
  availablePorts: "2",
});

// Builds an empty photo draft entry.
export const createDefaultPhoto = (): StationPhotoDraft => ({
  id: makeId("photo"),
  label: "",
  gradient: "",
});

// Builds blank form values for the add-station form (one starter connector + photo).
export const createEmptyStationDefaults = (
  connectorType: ConnectorType
): StationFormValues => ({
  name: "",
  address: "",
  status: "AVAILABLE",
  lat: "",
  lng: "",
  connectors: [createDefaultConnector(connectorType)],
  pricing: { currency: "IDR", perKwh: "", perMinute: "", parkingFee: "" },
  amenities: "",
  photos: [createDefaultPhoto()],
  notes: "",
});

// Selects the preferred map center based on form coordinates and fallback.
export const getMapCenter = (
  lat: string,
  lng: string,
  fallback?: { lat: number; lng: number }
) => {
  const latNum = lat.trim() ? Number(lat) : Number.NaN;
  const lngNum = lng.trim() ? Number(lng) : Number.NaN;
  if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
    return { lat: latNum, lng: lngNum };
  }
  return fallback ?? DEFAULT_MAP_CENTER;
};

// Builds the API payload from typed (string-draft) react-hook-form values.
// Validation is the zod schema's job; this only shapes/coerces the values.
export const buildStationPayload = (
  values: StationFormValues
): StationFormPayload => {
  const connectors = values.connectors
    .map((c) => {
      const powerKW = Number(c.powerKW);
      const ports = Number(c.ports);
      const availablePorts = Number(c.availablePorts);
      if (
        !VALID_CONNECTORS.has(c.type) ||
        !Number.isFinite(powerKW) ||
        !Number.isFinite(ports) ||
        !Number.isFinite(availablePorts)
      ) {
        return null;
      }
      if (ports <= 0 || powerKW <= 0 || availablePorts < 0) return null;
      return {
        type: c.type,
        powerKW,
        ports,
        availablePorts: Math.min(availablePorts, ports),
      };
    })
    .filter(Boolean) as StationConnectorPayload[];

  const perKwh = Number(values.pricing.perKwh);
  const perMinute = values.pricing.perMinute.trim()
    ? Number(values.pricing.perMinute)
    : null;
  const parkingFee = values.pricing.parkingFee.trim() || undefined;

  const amenities = values.amenities
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const photos = values.photos
    .map((p) => ({ label: p.label.trim(), gradient: p.gradient.trim() }))
    .filter((p) => p.label && p.gradient);

  return {
    name: values.name.trim(),
    address: values.address.trim(),
    status: values.status,
    lat: Number(values.lat),
    lng: Number(values.lng),
    connectors,
    pricing: {
      currency: values.pricing.currency.trim(),
      perKwh,
      ...(perMinute && perMinute > 0 ? { perMinute } : {}),
      ...(parkingFee ? { parkingFee } : {}),
    },
    amenities,
    photos,
    notes: values.notes.trim() || null,
    lastUpdatedISO: new Date().toISOString(),
  };
};

// Serializes a station payload into multipart FormData for requests that carry a
// feature-image file. Scalars go as strings; structured fields are JSON-encoded so
// the backend's normalizeStationBody middleware can restore them for validation.
export const buildStationFormData = (
  payload: StationFormPayload
): FormData => {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("address", payload.address);
  form.append("status", payload.status);
  form.append("lat", String(payload.lat));
  form.append("lng", String(payload.lng));
  form.append("lastUpdatedISO", payload.lastUpdatedISO);
  form.append("connectors", JSON.stringify(payload.connectors));
  form.append("pricing", JSON.stringify(payload.pricing));
  form.append("amenities", JSON.stringify(payload.amenities));
  form.append("photos", JSON.stringify(payload.photos));
  if (typeof payload.notes === "string") {
    form.append("notes", payload.notes);
  }
  return form;
};
