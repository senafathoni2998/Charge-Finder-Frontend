import { useCallback, useEffect, useRef, useState } from "react";

// Captures the browser's `beforeinstallprompt` event so the app can offer its own
// "Install" affordance and trigger the native prompt on demand. Chromium-only by
// design — Safari/iOS never fire this event (there users install via the Share
// sheet), so `canInstall` simply stays false there.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export type InstallPromptState = {
  canInstall: boolean;
  promptInstall: () => Promise<InstallOutcome>;
};

export function useInstallPrompt(): InstallPromptState {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Suppress Chrome's default mini-infobar; we present our own button.
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    const deferred = deferredRef.current;
    if (!deferred) return "unavailable";
    // Consume the one-shot event up front: clearing the ref before awaiting stops a
    // second tap from re-invoking prompt() on a spent event (which rejects with
    // InvalidStateError). The try/catch keeps a rejected prompt from surfacing as an
    // unhandled rejection, and `finally` always hides the now-dead button.
    deferredRef.current = null;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      return choice.outcome;
    } catch {
      return "unavailable";
    } finally {
      setCanInstall(false);
    }
  }, []);

  return { canInstall, promptInstall };
}
