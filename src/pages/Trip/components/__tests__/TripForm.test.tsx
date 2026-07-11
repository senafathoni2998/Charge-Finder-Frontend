import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TripForm, { type TripFormState } from "../TripForm";
import type { UserCar } from "../../../../features/auth/authSlice";

const emptyValue: TripFormState = {
  origin: null,
  destination: null,
  vehicleId: "",
  rangeKm: "",
  startBatteryPercent: "",
  bufferPercent: "",
  chargeToPercent: "",
  minPowerKW: "",
  maxDetourKm: "",
  efficiencyKwhPer100Km: "",
  connectorTypes: [],
};

const cars: UserCar[] = [
  { id: "c1", name: "Tesla Model 3", connectorTypes: ["CCS2"], minKW: 50, batteryCapacity: 75 },
];

const baseProps = {
  value: emptyValue,
  onChange: vi.fn(),
  cars,
  pickMode: "origin" as const,
  onPickModeChange: vi.fn(),
  onUseMyLocation: vi.fn(),
  locating: false,
  onPlan: vi.fn(),
  planning: false,
  error: null,
};

describe("TripForm", () => {
  it("renders the route and vehicle sections + plan button", () => {
    render(<TripForm {...baseProps} />);
    expect(screen.getByText("Route")).toBeInTheDocument();
    expect(screen.getByText("Vehicle & range")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan trip" })).toBeInTheDocument();
  });

  it("calls onPlan when the plan button is clicked", () => {
    const onPlan = vi.fn();
    render(<TripForm {...baseProps} onPlan={onPlan} />);
    fireEvent.click(screen.getByRole("button", { name: "Plan trip" }));
    expect(onPlan).toHaveBeenCalled();
  });

  it("calls onUseMyLocation", () => {
    const onUseMyLocation = vi.fn();
    render(<TripForm {...baseProps} onUseMyLocation={onUseMyLocation} />);
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    expect(onUseMyLocation).toHaveBeenCalled();
  });

  it("patches the origin when a latitude is entered", () => {
    const onChange = vi.fn();
    render(<TripForm {...baseProps} onChange={onChange} />);
    // First "Latitude" field is the origin's.
    fireEvent.change(screen.getAllByLabelText("Latitude")[0], {
      target: { value: "-6.2" },
    });
    expect(onChange).toHaveBeenCalledWith({
      origin: { lat: -6.2, lng: 0, label: undefined },
    });
  });

  it("shows the planning label while planning", () => {
    render(<TripForm {...baseProps} planning />);
    expect(screen.getByRole("button", { name: "Planning…" })).toBeDisabled();
  });

  it("renders the error", () => {
    render(<TripForm {...baseProps} error="Set both an origin and a destination." />);
    expect(
      screen.getByText("Set both an origin and a destination.")
    ).toBeInTheDocument();
  });
});
