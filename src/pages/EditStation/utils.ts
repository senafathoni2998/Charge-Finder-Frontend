import type { ConnectorType, Station } from "../../models/model";
import type {
  StationConnectorDraft,
  StationFormValues,
  StationPhotoDraft,
} from "../../forms/schemas";
import {
  createDefaultConnector,
  createDefaultPhoto,
  getMapCenter,
  makeId,
} from "../AddStation/stationFormUtils";

// Re-exported so existing callers/tests can keep importing these from here.
export { createDefaultConnector, createDefaultPhoto, getMapCenter, makeId };

// Converts station connector data into editable drafts.
const buildConnectorDrafts = (
  station: Station | null,
  defaultConnectorType: ConnectorType
): StationConnectorDraft[] => {
  if (station?.connectors?.length) {
    return station.connectors.map((connector) => ({
      id: makeId("connector"),
      type: connector.type,
      powerKW: String(connector.powerKW ?? ""),
      ports: String(connector.ports ?? ""),
      availablePorts: String(connector.availablePorts ?? ""),
    }));
  }
  return [createDefaultConnector(defaultConnectorType)];
};

// Converts station photos into editable drafts.
const buildPhotoDrafts = (station: Station | null): StationPhotoDraft[] => {
  if (station?.photos?.length) {
    return station.photos.map((photo) => ({
      id: makeId("photo"),
      label: photo.label || "",
      gradient: photo.gradient || "",
    }));
  }
  return [createDefaultPhoto()];
};

// Builds the initial form values from an existing station record.
export const buildEditStationDefaults = (
  station: Station | null,
  defaultConnectorType: ConnectorType
): StationFormValues => ({
  name: station?.name ?? "",
  address: station?.address ?? "",
  status: station?.status ?? "AVAILABLE",
  lat: Number.isFinite(station?.lat ?? Number.NaN) ? String(station?.lat) : "",
  lng: Number.isFinite(station?.lng ?? Number.NaN) ? String(station?.lng) : "",
  connectors: buildConnectorDrafts(station, defaultConnectorType),
  pricing: {
    currency: station?.pricing?.currency || "IDR",
    perKwh:
      station?.pricing?.perKwh != null ? String(station.pricing.perKwh) : "",
    perMinute:
      station?.pricing?.perMinute != null
        ? String(station.pricing.perMinute)
        : "",
    parkingFee: station?.pricing?.parkingFee || "",
  },
  amenities: station?.amenities?.join(", ") || "",
  photos: buildPhotoDrafts(station),
  notes: station?.notes || "",
});
