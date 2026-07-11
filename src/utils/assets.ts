// Shared asset helpers for user- and station-uploaded images.

const ASSET_BASE_URL =
  import.meta.env.VITE_APP_ASSET_URL?.trim() || "";

/**
 * Resolves a stored image path (e.g. "uploads/images/2026/07/<uuid>.png") into a
 * URL usable as an <img src>. Absolute (http/data/blob) values pass through. A
 * relative path is prefixed with VITE_APP_ASSET_URL when configured; otherwise it
 * is made root-relative (leading slash) so it resolves against the site root on
 * ANY route depth — a bare "uploads/…" would otherwise resolve against a nested
 * route path (e.g. /admin/stations/:id/) and 404. Returns null for empty input.
 */
export const resolveAssetUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|data:|blob:)/i.test(trimmed)) return trimmed;
  if (!ASSET_BASE_URL) return `/${trimmed.replace(/^\/+/, "")}`;
  return `${ASSET_BASE_URL.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
};

// Keep in sync with the backend multer limit (fileUpload.ts: 500000 bytes).
export const MAX_IMAGE_UPLOAD_BYTES = 500000;

// The image MIME types the backend accepts (fileUpload.ts MIME_TYPE_MAP). The
// client guard matches this exact whitelist — not a loose image/* check — so
// unsupported formats (webp/gif/svg/…) are rejected instantly with a localized
// message rather than passing here and failing server-side.
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

/** True when the file's MIME type is one the backend accepts. */
export const isAllowedImageType = (file: File): boolean =>
  (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
