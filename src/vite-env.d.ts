/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL, including the /api prefix and no trailing slash. */
  readonly VITE_APP_BACKEND_URL: string;
  /** MapTiler API key for map tiles. Optional — falls back to OSM tiles in dev. */
  readonly VITE_MAPTILER_KEY?: string;
  /** Base URL for uploaded assets (images). Optional — relative paths pass through. */
  readonly VITE_APP_ASSET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
