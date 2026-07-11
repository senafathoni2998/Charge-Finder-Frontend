import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from "../notifications";

class MockNotification {
  static permission: NotificationPermission = "default";
  static requestPermission = vi.fn();
  static instances: MockNotification[] = [];
  title: string;
  options: unknown;
  constructor(title: string, options?: unknown) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
}

const installNotification = (permission: NotificationPermission = "default") => {
  MockNotification.permission = permission;
  MockNotification.requestPermission = vi.fn().mockResolvedValue(permission);
  MockNotification.instances = [];
  (window as unknown as { Notification: unknown }).Notification =
    MockNotification;
};
const removeNotification = () => {
  delete (window as unknown as { Notification?: unknown }).Notification;
};

afterEach(() => removeNotification());

describe("notifications util", () => {
  describe("isNotificationSupported", () => {
    it("is false when the Notification API is absent", () => {
      removeNotification();
      expect(isNotificationSupported()).toBe(false);
    });
    it("is true when present", () => {
      installNotification();
      expect(isNotificationSupported()).toBe(true);
    });
  });

  describe("getNotificationPermission", () => {
    it("returns 'unsupported' when absent", () => {
      removeNotification();
      expect(getNotificationPermission()).toBe("unsupported");
    });
    it("returns the current permission when present", () => {
      installNotification("granted");
      expect(getNotificationPermission()).toBe("granted");
    });
  });

  describe("requestNotificationPermission", () => {
    it("returns 'unsupported' when absent", async () => {
      removeNotification();
      expect(await requestNotificationPermission()).toBe("unsupported");
    });
    it("does not prompt again once the permission is decided", async () => {
      installNotification("granted");
      expect(await requestNotificationPermission()).toBe("granted");
      expect(MockNotification.requestPermission).not.toHaveBeenCalled();
    });
    it("prompts when the permission is still default", async () => {
      installNotification("default");
      MockNotification.requestPermission.mockResolvedValue("granted");
      expect(await requestNotificationPermission()).toBe("granted");
      expect(MockNotification.requestPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe("showBrowserNotification", () => {
    it("does nothing when permission is not granted", () => {
      installNotification("denied");
      expect(showBrowserNotification("Title", { body: "Body" })).toBe(false);
      expect(MockNotification.instances).toHaveLength(0);
    });
    it("does nothing when unsupported", () => {
      removeNotification();
      expect(showBrowserNotification("Title")).toBe(false);
    });
    it("shows a notification when permission is granted", () => {
      installNotification("granted");
      expect(
        showBrowserNotification("Title", { body: "Body", tag: "charge-1" })
      ).toBe(true);
      expect(MockNotification.instances).toHaveLength(1);
      expect(MockNotification.instances[0].title).toBe("Title");
      expect(MockNotification.instances[0].options).toEqual({
        body: "Body",
        tag: "charge-1",
      });
    });
  });
});
