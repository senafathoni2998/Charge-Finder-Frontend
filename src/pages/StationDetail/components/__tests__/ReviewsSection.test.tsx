import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewsSection from "../ReviewsSection";
import { useStationReviews } from "../../hooks/useStationReviews";

const navigateMock = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/station/s1", search: "", hash: "" }),
}));

vi.mock("../../hooks/useStationReviews", () => ({
  useStationReviews: vi.fn(),
}));

// Stub the leaf components so this test focuses on ReviewsSection orchestration.
vi.mock("../ReviewForm", () => ({
  default: ({ isEditing, error, onSubmit, onDelete }: any) => (
    <div data-testid="review-form">
      <span>{isEditing ? "editing" : "new"}</span>
      {error ? <span data-testid="form-error">{error}</span> : null}
      <button onClick={() => onSubmit({ rating: 5, comment: "x" })}>form-submit</button>
      {onDelete ? <button onClick={onDelete}>form-delete</button> : null}
    </div>
  ),
}));

vi.mock("../ReviewItem", () => ({
  default: ({ review, isOwn, canDelete, onDelete }: any) => (
    <div data-testid={`review-${review.id}`}>
      {review.user?.name}
      {isOwn ? " (you)" : ""}
      {canDelete ? (
        <button onClick={() => onDelete(review)}>del-{review.id}</button>
      ) : null}
    </div>
  ),
}));

const mockedHook = vi.mocked(useStationReviews);

const hookState = (overrides: Partial<ReturnType<typeof useStationReviews>> = {}) => ({
  reviews: [],
  summary: null,
  myReview: null,
  pagination: { limit: 10, offset: 0, total: 0 },
  loading: false,
  loadError: null,
  loadingMore: false,
  submitting: false,
  hasMore: false,
  submit: vi.fn().mockResolvedValue({ ok: true }),
  remove: vi.fn().mockResolvedValue({ ok: true }),
  moderateRemove: vi.fn().mockResolvedValue({ ok: true }),
  loadMore: vi.fn(),
  ...overrides,
});

const baseProps = {
  stationId: "s1",
  isAuthenticated: true,
  currentUserId: "u1",
  isAdmin: false,
  onReviewsChanged: vi.fn(),
};

describe("ReviewsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeletons while loading", () => {
    mockedHook.mockReturnValue(hookState({ loading: true }) as any);
    const { container } = render(<ReviewsSection {...baseProps} />);
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no reviews", () => {
    mockedHook.mockReturnValue(
      hookState({ summary: { average: 0, count: 0, distribution: {} } }) as any
    );
    render(<ReviewsSection {...baseProps} />);
    expect(screen.getByText(/No reviews yet/)).toBeInTheDocument();
  });

  it("renders the aggregate summary when reviews exist", () => {
    mockedHook.mockReturnValue(
      hookState({
        summary: { average: 4.5, count: 2, distribution: { "5": 1, "4": 1 } },
      }) as any
    );
    render(<ReviewsSection {...baseProps} />);
    expect(screen.getAllByText("4.5").length).toBeGreaterThan(0);
    expect(screen.getByText("2 reviews")).toBeInTheDocument();
  });

  it("shows a login prompt for unauthenticated users and redirects with a next param", () => {
    mockedHook.mockReturnValue(hookState() as any);
    render(<ReviewsSection {...baseProps} isAuthenticated={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(navigateMock).toHaveBeenCalledWith("/login?next=%2Fstation%2Fs1");
  });

  it("shows the review form for authenticated users", () => {
    mockedHook.mockReturnValue(hookState() as any);
    render(<ReviewsSection {...baseProps} />);
    expect(screen.getByTestId("review-form")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("excludes the caller's own review from the list", () => {
    const mine = { id: "r1", user: { id: "u1", name: "Me" } };
    const other = { id: "r2", user: { id: "u2", name: "Bob" } };
    mockedHook.mockReturnValue(
      hookState({
        reviews: [mine, other] as any,
        myReview: mine as any,
        summary: { average: 4, count: 2, distribution: {} },
      }) as any
    );
    render(<ReviewsSection {...baseProps} />);
    expect(screen.queryByTestId("review-r1")).not.toBeInTheDocument();
    expect(screen.getByTestId("review-r2")).toBeInTheDocument();
  });

  it("renders a load-more button that calls loadMore", () => {
    const loadMore = vi.fn();
    mockedHook.mockReturnValue(
      hookState({
        reviews: [{ id: "r2", user: { id: "u2", name: "Bob" } }] as any,
        summary: { average: 4, count: 5, distribution: {} },
        hasMore: true,
        loadMore,
      }) as any
    );
    render(<ReviewsSection {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Show more reviews" }));
    expect(loadMore).toHaveBeenCalled();
  });

  it("lets an admin moderate (delete) another user's review", () => {
    const moderateRemove = vi.fn().mockResolvedValue({ ok: true });
    mockedHook.mockReturnValue(
      hookState({
        reviews: [{ id: "r2", user: { id: "u2", name: "Bob" } }] as any,
        summary: { average: 4, count: 1, distribution: {} },
        moderateRemove,
      }) as any
    );
    render(<ReviewsSection {...baseProps} isAdmin />);
    fireEvent.click(screen.getByRole("button", { name: "del-r2" }));
    expect(moderateRemove).toHaveBeenCalledWith("r2");
  });

  it("surfaces a submit error from the hook", async () => {
    const submit = vi.fn().mockResolvedValue({ ok: false, error: "Not eligible" });
    mockedHook.mockReturnValue(hookState({ submit }) as any);
    render(<ReviewsSection {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "form-submit" }));
    expect(await screen.findByTestId("form-error")).toHaveTextContent("Not eligible");
  });
});
