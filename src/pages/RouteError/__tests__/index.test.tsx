import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import RouteErrorPage from "../index";

// Mock React Router hooks
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useRouteError: vi.fn(() => new Error("Test error")),
    useLocation: vi.fn(() => ({ pathname: "/test-path" })),
    useNavigate: vi.fn(() => mockNavigate),
  };
});

// Mock the icon
vi.mock("@mui/icons-material/ErrorOutline", () => ({
  default: () => <div data-testid="error-icon">ErrorOutlineIcon</div>,
}));

describe("RouteErrorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render the error icon", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("error-icon")).toBeInTheDocument();
  });

  it("should render the default error title", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render the error message from Error object", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    // The mocked error returns 'Test error' message
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should render the Go to home button", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Go to home")).toBeInTheDocument();
  });

  it("should render the Go back button", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });

  it("should display the current path", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Path: /test-path")).toBeInTheDocument();
  });

  it("should call navigate(-1) when Go back button is clicked", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    const goBackButton = screen.getByText("Go back");
    fireEvent.click(goBackButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should call navigate with "/" when Go to home button is clicked', () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    const goHomeButton = screen.getByText("Go to home");
    fireEvent.click(goHomeButton);
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("should render within a Card component", () => {
    render(
      <MemoryRouter>
        <RouteErrorPage />
      </MemoryRouter>,
    );
    const card = screen
      .getByText("Something went wrong")
      .closest(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });
});
