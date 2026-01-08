import type { Availability, Connector, ConnectorType } from "../../models/model";

// Station shape needed for list + map views.
export type Station = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  connectors: Connector[];
  status: Availability;
  lastUpdatedISO: string;
};

export type StationWithDistance = Station & { distanceKm: number };

export type FilterStatus = "" | Availability;

export type StationFilters = {
  q: string;
  status: FilterStatus;
  connectorSet: Set<ConnectorType>;
  minKW: number;
};

export type StationBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  latSpan: number;
  lngSpan: number;
};
