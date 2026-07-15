import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerServiceWorker } from "../registerServiceWorker";

type FakeSW = EventTarget & {
  controller: unknown;
  register: ReturnType<typeof vi.fn>;
};

const makeSW = (controller: unknown): FakeSW => {
  const sw = new EventTarget() as FakeSW;
  sw.controller = controller;
  sw.register = vi.fn().mockResolvedValue({});
  return sw;
};

const installSW = (sw: FakeSW | undefined) => {
  if (sw === undefined) {
    Reflect.deleteProperty(navigator, "serviceWorker");
    return;
  }
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: sw,
  });
};

const setReadyState = (state: DocumentReadyState) => {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => state,
  });
};

describe("registerServiceWorker", () => {
  beforeEach(() => {
    setReadyState("complete");
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "serviceWorker");
    vi.restoreAllMocks();
  });

  it("does nothing when disabled", () => {
    const sw = makeSW(null);
    installSW(sw);
    registerServiceWorker({ enabled: false });
    expect(sw.register).not.toHaveBeenCalled();
  });

  it("does nothing when the browser lacks service workers", () => {
    installSW(undefined);
    // Must not throw even though navigator.serviceWorker is absent.
    expect(() => registerServiceWorker({ enabled: true })).not.toThrow();
  });

  it("registers the SW url immediately when the document is already loaded", () => {
    const sw = makeSW(null);
    installSW(sw);
    registerServiceWorker({ enabled: true, swUrl: "/sw.js" });
    expect(sw.register).toHaveBeenCalledWith("/sw.js");
  });

  it("defers registration until window load when the document is still loading", () => {
    const sw = makeSW(null);
    installSW(sw);
    setReadyState("loading");

    registerServiceWorker({ enabled: true, swUrl: "/sw.js" });
    expect(sw.register).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("load"));
    expect(sw.register).toHaveBeenCalledWith("/sw.js");
  });

  it("reloads once when an updated worker takes control (page was controlled)", () => {
    const sw = makeSW({}); // already controlled → an update, not first install
    installSW(sw);
    const onReloadNeeded = vi.fn();

    registerServiceWorker({ enabled: true, onReloadNeeded });

    sw.dispatchEvent(new Event("controllerchange"));
    sw.dispatchEvent(new Event("controllerchange"));
    expect(onReloadNeeded).toHaveBeenCalledTimes(1);
  });

  it("does not reload on the first install (page had no controller)", () => {
    const sw = makeSW(null); // no controller at start → first install
    installSW(sw);
    const onReloadNeeded = vi.fn();

    registerServiceWorker({ enabled: true, onReloadNeeded });

    sw.dispatchEvent(new Event("controllerchange"));
    expect(onReloadNeeded).not.toHaveBeenCalled();
  });

  it("reloads on a genuine update even when the session started uncontrolled", () => {
    const sw = makeSW(null); // first-time visitor: uncontrolled at load
    installSW(sw);
    const onReloadNeeded = vi.fn();

    registerServiceWorker({ enabled: true, onReloadNeeded });

    // 1st controllerchange = the initial clients.claim → must be ignored.
    sw.dispatchEvent(new Event("controllerchange"));
    expect(onReloadNeeded).not.toHaveBeenCalled();

    // A later deploy's worker takes over → this IS an update → reload exactly once.
    sw.dispatchEvent(new Event("controllerchange"));
    sw.dispatchEvent(new Event("controllerchange"));
    expect(onReloadNeeded).toHaveBeenCalledTimes(1);
  });
});
