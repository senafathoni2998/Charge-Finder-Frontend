// Thin wrapper around the browser Notification API for charging alerts (charge
// complete / notify-me-at-X%). Foreground/backgrounded-tab only — there is no
// service worker or Web Push here, so notifications require the tab to be open.
// Every function degrades gracefully where the API is unavailable or denied.

// The Notification.permission values plus an "unsupported" sentinel. Spelled out
// (rather than the DOM `NotificationPermission` type) so the lint no-undef rule,
// which doesn't resolve ambient DOM type names, stays quiet.
export type NotificationSupport =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export const isNotificationSupported = (): boolean =>
  typeof window !== "undefined" && "Notification" in window;

export const getNotificationPermission = (): NotificationSupport =>
  isNotificationSupported() ? Notification.permission : "unsupported";

/**
 * Requests permission if it hasn't been decided yet. Must be called from a user
 * gesture (e.g. starting a charge). Returns the resulting permission, or
 * "unsupported" when the API is absent.
 */
export const requestNotificationPermission =
  async (): Promise<NotificationSupport> => {
    if (!isNotificationSupported()) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  };

/**
 * Shows an OS notification if supported AND permission is granted. Returns true
 * when a notification was actually shown. `tag` collapses repeat notifications for
 * the same session so they don't stack.
 */
export const showBrowserNotification = (
  title: string,
  options: { body?: string; tag?: string } = {}
): boolean => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }
  try {
    new Notification(title, { body: options.body, tag: options.tag });
    return true;
  } catch {
    return false;
  }
};
