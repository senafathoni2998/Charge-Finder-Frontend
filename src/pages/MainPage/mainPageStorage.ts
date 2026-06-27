const LOCAL_KEYS = {
  activeCarId: "cf_active_car_id",
  legacyCar: "cf_user_car",
  demoHintSeen: "cf_demo_hint_seen",
};

// Whether the one-time "these are demo stations" hint has already been shown.
export const hasSeenDemoHint = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(LOCAL_KEYS.demoHintSeen) === "1";
  } catch {
    return true;
  }
};

// Records that the demo-station hint has been shown (so it never nags again).
export const markDemoHintSeen = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEYS.demoHintSeen, "1");
  } catch {
    // ignore
  }
};

// Persists the active car id for quick reloads.
export const persistActiveCarId = (carId: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (carId) window.localStorage.setItem(LOCAL_KEYS.activeCarId, carId);
    else window.localStorage.removeItem(LOCAL_KEYS.activeCarId);
    window.localStorage.removeItem(LOCAL_KEYS.legacyCar);
  } catch {
    // ignore
  }
};
