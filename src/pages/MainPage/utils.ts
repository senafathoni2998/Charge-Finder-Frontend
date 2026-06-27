// Builds a Google Maps query URL for a station coordinate.
export const buildMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

// Identifies a backend-seeded demo station (see getStations' demo seeding). The
// backend stamps the name "<name> (Demo · STATUS)" and a "Demo station …" note.
export const isDemoStation = (station: {
  name?: string;
  notes?: string | null;
}): boolean =>
  Boolean(station.name?.includes("(Demo")) ||
  Boolean(station.notes?.startsWith("Demo station"));
