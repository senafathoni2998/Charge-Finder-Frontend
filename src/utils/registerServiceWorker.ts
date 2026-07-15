// Registers the Charge Finder service worker (public/sw.js) that powers install +
// offline support. Kept out of the SW itself so the page-side glue — gating to
// production, deferring to load, and reloading once after an update — stays
// testable in jsdom.

export type RegisterServiceWorkerOptions = {
  /** Whether to register at all. Defaults to `import.meta.env.PROD`. */
  enabled?: boolean;
  /** SW script URL. Defaults to "/sw.js". */
  swUrl?: string;
  /** Called when an updated worker takes control. Defaults to a full reload. */
  onReloadNeeded?: () => void;
};

export function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
): void {
  const enabled = options.enabled ?? import.meta.env.PROD;
  const swUrl = options.swUrl ?? "/sw.js";

  if (!enabled) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // The very first install fires `controllerchange` too (no controller -> new
  // worker via clients.claim); reloading then would be a pointless flash. Skip only
  // THAT initial claim — every later controllerchange is a genuine update and must
  // reload once. (Gating permanently on the load-time controller would wrongly
  // suppress update reloads for any session that started uncontrolled — a
  // first-time visitor or a hard reload that bypassed the SW.)
  let pendingInitialClaim = !navigator.serviceWorker.controller;
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    if (pendingInitialClaim) {
      pendingInitialClaim = false;
      return;
    }
    reloading = true;
    (options.onReloadNeeded ?? (() => window.location.reload()))();
  });

  const register = () => {
    // Failures are non-fatal — the app runs fine without offline support.
    navigator.serviceWorker.register(swUrl).catch(() => {});
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
