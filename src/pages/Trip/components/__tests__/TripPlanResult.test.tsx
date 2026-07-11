import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TripPlanResult from "../TripPlanResult";
import type { TripPlan } from "../../../../api/trips";

const feasiblePlan: TripPlan = {
  feasible: true,
  origin: { lat: 1, lng: 2 },
  destination: { lat: 3, lng: 4 },
  params: {
    fullRangeKm: 300,
    startBatteryPercent: 90,
    bufferPercent: 10,
    chargeToPercent: 80,
    minPowerKW: 0,
    maxDetourKm: 25,
    allowedConnectorTypes: [],
    efficiencyKwhPer100Km: 18,
  },
  directDistanceKm: 120,
  totalDistanceKm: 130,
  totalStops: 1,
  reserveKm: 30,
  usableStartKm: 270,
  perStopUsableKm: 210,
  stops: [
    {
      station: { id: "s1", name: "Midway Charge", address: "KM 60", lat: 2, lng: 3 },
      connectorType: "CCS2",
      powerKW: 120,
      distanceFromPrevKm: 60,
      cumulativeKm: 60,
      detourKm: 2,
      arrivalBatteryPercent: 25,
      departBatteryPercent: 80,
    },
  ],
  legs: [],
};

const defaultProps = {
  plan: feasiblePlan,
  onSave: vi.fn(),
  saving: false,
  saveError: null,
  saved: false,
};

describe("TripPlanResult", () => {
  it("renders a feasible banner, summary and stops", () => {
    render(<TripPlanResult {...defaultProps} />);
    expect(screen.getByText("Feasible route (1 stops)")).toBeInTheDocument();
    expect(screen.getByText("Midway Charge")).toBeInTheDocument();
    expect(screen.getByText("CCS2 · 120 kW")).toBeInTheDocument();
    expect(screen.getByText(/Arrive 25% → depart 80%/)).toBeInTheDocument();
  });

  it("renders an infeasible banner with the reason and no save form", () => {
    render(
      <TripPlanResult
        {...defaultProps}
        plan={{ ...feasiblePlan, feasible: false, reason: "No station within range." }}
      />
    );
    expect(screen.getByText("No feasible route")).toBeInTheDocument();
    expect(screen.getByText("No station within range.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save trip" })).not.toBeInTheDocument();
  });

  it("saves with the entered name", () => {
    const onSave = vi.fn();
    render(<TripPlanResult {...defaultProps} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Trip name (optional)"), {
      target: { value: "Bandung run" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save trip" }));
    expect(onSave).toHaveBeenCalledWith("Bandung run");
  });

  it("shows a no-stops-needed note for a feasible plan with no stops", () => {
    render(
      <TripPlanResult {...defaultProps} plan={{ ...feasiblePlan, stops: [], totalStops: 0 }} />
    );
    expect(
      screen.getByText("You can reach the destination without charging.")
    ).toBeInTheDocument();
  });
});
