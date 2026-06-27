/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL, including the /api prefix and no trailing slash. */
  readonly VITE_APP_BACKEND_URL: string;
  /** MapTiler API key for map tiles. Optional — falls back to OSM tiles in dev. */
  readonly VITE_MAPTILER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
