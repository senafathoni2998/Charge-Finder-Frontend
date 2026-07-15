import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OfflineBanner from "../OfflineBanner";

describe("OfflineBanner", () => {
  it("renders nothing when online and not using cached data", () => {
    render(
      <OfflineBanner isOnline usingCachedData={false} savedAt={null} />,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an offline message when offline with no saved snapshot", () => {
    render(
      <OfflineBanner isOnline={false} usingCachedData={false} savedAt={null} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/offline/i);
  });

  it("shows the saved age when offline with cached data", () => {
    const savedAt = Date.now() - 5 * 60 * 1000;
    render(
      <OfflineBanner isOnline={false} usingCachedData savedAt={savedAt} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/5 min ago/i);
  });

  it("shows a network-unavailable notice when online but on cached data", () => {
    const savedAt = Date.now() - 3 * 60 * 1000;
    render(<OfflineBanner isOnline usingCachedData savedAt={savedAt} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/network unavailable/i);
    expect(alert).toHaveTextContent(/3 min ago/i);
  });
});
