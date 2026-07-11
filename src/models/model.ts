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
  // Denormalized review aggregates the backend keeps in sync (present on reads;
  // default 0 for stations with no reviews yet).
  ratingAverage?: number;
  ratingCount?: number;
};

// Live connector availability for a station (from the uncached availability
// endpoint the detail page polls). `connectors` reuses the Connector shape.
export type StationAvailability = {
  stationId: string;
  status: Availability;
  lastUpdatedISO: string;
  connectors: Connector[];
};

// The public reviewer fields exposed by the reviews API (never email/etc.).
export type ReviewUser = {
  id: string | null;
  name: string | null;
  image: string | null;
};

export type StationReview = {
  id: string;
  station: string | null;
  user: ReviewUser;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

// Aggregate summary returned alongside a station's reviews list. `distribution`
// is keyed by star value "1".."5".
export type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<string, number>;
};
