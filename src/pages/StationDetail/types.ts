import type { Availability, Connector } from "../../models/model";

export type StationPhoto = {
  label: string;
  gradient: string;
};

export type StationPricing = {
  currency: string;
  perKwh: number;
  perMinute?: number;
  parkingFee?: string;
};

export type Station = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  connectors: Connector[];
  status: Availability;
  lastUpdatedISO: string;
  photos: StationPhoto[];
  pricing: StationPricing;
  amenities: string[];
  notes?: string;
};

export type PaymentMethod = {
  id: string;
  label: string;
  helper: string;
};

export type Ticket = {
  id: string;
  methodId: string;
  methodLabel: string;
  priceLabel: string;
  purchasedAt: string;
};

export type ChargingStatus = "idle" | "charging" | "done";
