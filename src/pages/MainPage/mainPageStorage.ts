const LOCAL_KEYS = {
  activeCarId: "cf_active_car_id",
  legacyCar: "cf_user_car",
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
