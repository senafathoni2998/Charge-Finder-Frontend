export function normalizeToCanvas(lat, lng, bounds) {
  // y inverted: higher lat -> smaller y
  const x = (lng - bounds.minLng) / bounds.lngSpan;
  const y = 1 - (lat - bounds.minLat) / bounds.latSpan;
  // clamp
  return {
    x: Math.min(0.98, Math.max(0.02, x)),
    y: Math.min(0.98, Math.max(0.02, y)),
  };
}
