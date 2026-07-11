import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SavedTripsList from "../SavedTripsList";
import type { SavedTrip } from "../../../../api/trips";

const trip: SavedTrip = {
  id: "t1",
  user: "u1",
  name: "Weekend trip",
  origin: { lat: 1, lng: 2, label: "Jakarta" },
  destination: { lat: 3, lng: 4, label: "Bandung" },
  fullRangeKm: 300,
  allowedConnectorTypes: ["CCS2"],
  feasible: true,
  directDistanceKm: 120,
  totalDistanceKm: 130,
  totalStops: 1,
  stops: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("SavedTripsList", () => {
  it("shows skeletons while loading", () => {
    const { container } = render(
      <SavedTripsList trips={[]} loading onLoad={vi.fn()} onDelete={vi.fn()} />
    );
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
  });

  it("shows an empty state", () => {
    render(<SavedTripsList trips={[]} loading={false} onLoad={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("No saved trips yet.")).toBeInTheDocument();
  });

  it("renders a trip card with route and summary", () => {
    render(<SavedTripsList trips={[trip]} loading={false} onLoad={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Weekend trip")).toBeInTheDocument();
    expect(screen.getByText("Jakarta → Bandung")).toBeInTheDocument();
    expect(screen.getByText("Feasible")).toBeInTheDocument();
  });

  it("calls onLoad and onDelete", () => {
    const onLoad = vi.fn();
    const onDelete = vi.fn();
    render(
      <SavedTripsList trips={[trip]} loading={false} onLoad={onLoad} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Load into planner" }));
    expect(onLoad).toHaveBeenCalledWith(trip);
    fireEvent.click(screen.getByRole("button", { name: "Delete trip" }));
    expect(onDelete).toHaveBeenCalledWith("t1");
  });
});
