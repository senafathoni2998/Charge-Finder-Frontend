export function minutesAgo(iso: string) {
  // Guard against a missing/malformed timestamp so the UI never renders "NaNm ago".
  if (!iso || typeof iso !== "string") return 0;
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return 0;
  const m = Math.max(0, Math.round(diffMs / 60_000));
  return m;
}