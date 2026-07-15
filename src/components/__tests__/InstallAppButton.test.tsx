import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import InstallAppButton from "../InstallAppButton";

const fireBeforeInstallPrompt = () => {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: string; platform: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
};

describe("InstallAppButton", () => {
  it("renders nothing until the app is installable", () => {
    render(<InstallAppButton />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows an install button after beforeinstallprompt and prompts on click", async () => {
    render(<InstallAppButton />);
    const event = fireBeforeInstallPrompt();

    const button = await screen.findByRole("button");
    expect(button).toBeInTheDocument();

    await act(async () => {
      button.click();
    });
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });
});
