export type Availability = "AVAILABLE" | "BUSY" | "OFFLINE";
export type ConnectorType = "CCS2" | "Type2" | "CHAdeMO";
export type ChargingSpeed = "NORMAL" | "FAST" | "ULTRA_FAST";

export type Connector = {
  type: ConnectorType;
  powerKW: number;
  ports: number; // total ports of this connector type
  availablePorts: number; // currently available ports
};

export type StationPhoto = {
  label: string;
  gradient: string;
};

export type StationPricing = {
  currency: string;
  perKwh: number;
  fastPerKwh?: number;
  ultraFastPerKwh?: number;
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
  /**
   * Public path of the station's uploaded feature (hero) image, resolved to a
   * full URL for display via resolveAssetUrl. Absent/null when none was uploaded.
   */
  featuredImage?: string | null;
  pricing: StationPricing;
  amenities: string[];
  notes?: string;
  isChargingHere?: boolean;
};
