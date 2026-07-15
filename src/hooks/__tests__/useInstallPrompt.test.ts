import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../useInstallPrompt";

type FakePrompt = Event & {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  preventDefault: () => void;
};

const fireBeforeInstallPrompt = (
  outcome: "accepted" | "dismissed" = "accepted",
): FakePrompt => {
  const event = new Event("beforeinstallprompt", {
    cancelable: true,
  }) as FakePrompt;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  // @ts-expect-error test shim
  event.userChoice = Promise.resolve({ outcome, platform: "web" });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
};

describe("useInstallPrompt", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts non-installable", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it("becomes installable after beforeinstallprompt (and suppresses the mini-infobar)", () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = fireBeforeInstallPrompt();
    expect(event.defaultPrevented).toBe(true);
    expect(result.current.canInstall).toBe(true);
  });

  it("prompts and reports the user's choice, then clears installability", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = fireBeforeInstallPrompt("accepted");

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(outcome).toBe("accepted");
    expect(result.current.canInstall).toBe(false);
  });

  it("returns 'unavailable' when there's no captured prompt", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });
    expect(outcome).toBe("unavailable");
  });

  it("resolves 'unavailable' (no unhandled rejection) when prompt() rejects", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = new Event("beforeinstallprompt", {
      cancelable: true,
    }) as FakePrompt;
    event.prompt = vi.fn().mockRejectedValue(new DOMException("InvalidState"));
    // @ts-expect-error test shim
    event.userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });
    act(() => {
      window.dispatchEvent(event);
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });
    expect(outcome).toBe("unavailable");
    expect(result.current.canInstall).toBe(false);
  });

  it("clears installability once the app is installed", () => {
    const { result } = renderHook(() => useInstallPrompt());
    fireBeforeInstallPrompt();
    expect(result.current.canInstall).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(result.current.canInstall).toBe(false);
  });
});
