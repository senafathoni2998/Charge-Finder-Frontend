// Builds a Google Maps query URL for a station coordinate.
export const buildMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
