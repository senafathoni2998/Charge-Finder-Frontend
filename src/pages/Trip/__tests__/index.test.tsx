import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TripPlannerPage from "../index";
import { useTripPlanner } from "../hooks/useTripPlanner";

// Redux/selectors, geolocation and geocode are stubbed so the test targets the
// page's orchestration (validation, placeholder/result switching).
vi.mock("../../../app/hooks", () => ({
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ auth: { cars: [] } }),
}));
vi.mock("../../../hooks/geolocation-hook", () => ({
  useGeoLocation: () => ({
    loc: null,
    loading: false,
    error: null,
    request: vi.fn(),
    requestId: 0,
  }),
}));
vi.mock("../../../api/geocode", () => ({
  reverseGeocode: vi.fn().mockResolvedValue({ ok: false, address: null }),
}));
vi.mock("../hooks/useTripPlanner", () => ({ useTripPlanner: vi.fn() }));

vi.mock("../components/TripMap", () => ({ default: () => <div data-testid="trip-map" /> }));
vi.mock("../components/SavedTripsList", () => ({ default: () => <div data-testid="saved" /> }));
vi.mock("../components/TripPlanResult", () => ({
  default: () => <div data-testid="plan-result" />,
}));
vi.mock("../components/TripForm", () => ({
  default: ({ onPlan, error }: { onPlan: () => void; error: string | null }) => (
    <div>
      <span data-testid="form-error">{error}</span>
      <button onClick={onPlan}>plan</button>
    </div>
  ),
}));

const mockedHook = vi.mocked(useTripPlanner);
const hookState = (overrides = {}) => ({
  plan: null,
  planning: false,
  planError: null,
  savedTrips: [],
  savedLoading: false,
  saving: false,
  saveError: null,
  saved: false,
  runPlan: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  ...overrides,
});

describe("TripPlannerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHook.mockReturnValue(hookState() as any);
  });

  it("shows the placeholder until a plan exists", () => {
    render(<TripPlannerPage />);
    expect(
      screen.getByText(/Set an origin and destination/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId("plan-result")).not.toBeInTheDocument();
  });

  it("shows the plan result once a plan is present", () => {
    mockedHook.mockReturnValue(hookState({ plan: { feasible: true, stops: [] } }) as any);
    render(<TripPlannerPage />);
    expect(screen.getByTestId("plan-result")).toBeInTheDocument();
  });

  it("validates missing origin/destination before planning", () => {
    const runPlan = vi.fn();
    mockedHook.mockReturnValue(hookState({ runPlan }) as any);
    render(<TripPlannerPage />);

    fireEvent.click(screen.getByRole("button", { name: "plan" }));

    expect(runPlan).not.toHaveBeenCalled();
    expect(screen.getByTestId("form-error")).toHaveTextContent(
      "Set both an origin and a destination."
    );
  });
});
