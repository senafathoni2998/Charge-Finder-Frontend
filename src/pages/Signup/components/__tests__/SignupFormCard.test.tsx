import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupFormCard from "../SignupFormCard";

type Overrides = Partial<React.ComponentProps<typeof SignupFormCard>>;

function renderCard(overrides: Overrides = {}) {
  const props = {
    serverError: null,
    onDismissError: vi.fn(),
    onSubmit: vi.fn(),
    onNavigateToLogin: vi.fn(),
    ...overrides,
  };
  render(<SignupFormCard {...props} />);
  return props;
}

const fillValid = () => {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Jane Doe" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "jane@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "password123" },
  });
};

describe("SignupFormCard", () => {
  it("should render the title + subtitle", () => {
    renderCard();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(
      screen.getByText("Save your car profile and personalize stations."),
    ).toBeInTheDocument();
  });

  it("should render all the fields", () => {
    renderCard();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Region")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("should render the profile photo section + upload button + hidden file input", () => {
    renderCard();
    expect(screen.getByText("Profile photo (optional)")).toBeInTheDocument();
    expect(screen.getByText("Upload photo")).toBeInTheDocument();
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute("hidden");
  });

  it("should render the (live) strength chip", () => {
    renderCard();
    expect(screen.getByText(/Strength:/)).toBeInTheDocument();
  });

  it("should render the Remember me checkbox, submit button, sign-in link and terms", () => {
    renderCard();
    expect(screen.getByText("Remember me")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(
      screen.getByText(
        "By creating an account, you agree to the demo Terms and Privacy.",
      ),
    ).toBeInTheDocument();
  });

  it("should call onNavigateToLogin when the Sign in link is clicked", () => {
    const props = renderCard();
    fireEvent.click(screen.getByText("Sign in"));
    expect(props.onNavigateToLogin).toHaveBeenCalledTimes(1);
  });

  it("should show the server error alert + call onDismissError on close", () => {
    const props = renderCard({ serverError: "Email already exists" });
    expect(screen.getByText("Email already exists")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(props.onDismissError).toHaveBeenCalledTimes(1);
  });

  it("should toggle password visibility", () => {
    renderCard();
    const passwordField = screen.getByLabelText("Password");
    expect(passwordField).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Show password"));
    expect(passwordField).toHaveAttribute("type", "text");
  });

  it("should call onSubmit with the values + options on a valid submit", async () => {
    const props = renderCard();
    fillValid();
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalled());
    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        confirm: "password123",
      }),
      { remember: true, image: null },
    );
  });

  it("should block submit + show an error for an invalid email", async () => {
    const props = renderCard();
    fillValid();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() =>
      expect(
        screen.getByText("Please enter a valid email address."),
      ).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("should block submit + show a mismatch error when passwords differ", async () => {
    const props = renderCard();
    fillValid();
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByText("Create account"));

    await waitFor(() =>
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("should render within a Card component", () => {
    const { container } = render(
      <SignupFormCard
        serverError={null}
        onDismissError={vi.fn()}
        onSubmit={vi.fn()}
        onNavigateToLogin={vi.fn()}
      />,
    );
    expect(container.querySelector(".MuiCard-root")).toBeInTheDocument();
  });
});
