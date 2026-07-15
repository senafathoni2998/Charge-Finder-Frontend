import { useSyncExternalStore } from "react";

// Tracks browser connectivity via navigator.onLine + the online/offline events.
// useSyncExternalStore keeps it tear-free across concurrent renders and gives a
// safe server snapshot (assume online) for any non-browser render.

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshot = (): boolean =>
  typeof navigator === "undefined" ? true : navigator.onLine;

const getServerSnapshot = (): boolean => true;

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
