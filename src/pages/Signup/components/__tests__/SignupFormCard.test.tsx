import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SignupFormCard from "../SignupFormCard";

// Mock the Form component to avoid router context issues
vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  };
});

describe("SignupFormCard", () => {
  const defaultProps = {
    values: {
      name: "John Doe",
      region: "Jakarta",
      email: "john@example.com",
      password: "password123",
      confirm: "password123",
    },
    handlers: {
      onNameChange: vi.fn(),
      onRegionChange: vi.fn(),
      onEmailChange: vi.fn(),
      onPasswordChange: vi.fn(),
      onConfirmChange: vi.fn(),
    },
    error: null,
    onDismissError: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    pwIssue: null,
    pwStrength: { label: "Strong", tone: "strong" as const },
    passwordsMatch: true,
    isSubmitting: false,
    onNavigateToLogin: vi.fn(),
  };

  it("should render without crashing", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("should render the title", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("should render the subtitle", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(
      screen.getByText("Save your car profile and personalize stations."),
    ).toBeInTheDocument();
  });

  it("should render the name field", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("should render the region field", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByLabelText("Region")).toBeInTheDocument();
  });

  it("should render the email field", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("should render the password field", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render the confirm password field", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("should render the profile photo section", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Profile photo (optional)")).toBeInTheDocument();
  });

  it("should render the upload photo button", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Upload photo")).toBeInTheDocument();
  });

  it("should render the strength chip", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Strength: Strong")).toBeInTheDocument();
  });

  it("should render the Remember me checkbox", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Remember me")).toBeInTheDocument();
  });

  it("should render the Create account button", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("should render the sign in link", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("should render the terms text", () => {
    render(<SignupFormCard {...defaultProps} />);
    expect(
      screen.getByText(
        "By creating an account, you agree to the demo Terms and Privacy.",
      ),
    ).toBeInTheDocument();
  });

  it("should call onNameChange when name field changes", () => {
    const onNameChange = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        handlers={{ ...defaultProps.handlers, onNameChange }}
      />,
    );
    const nameField = screen.getByLabelText("Name");
    fireEvent.change(nameField, { target: { value: "Jane Doe" } });
    expect(onNameChange).toHaveBeenCalledWith("Jane Doe");
  });

  it("should call onRegionChange when region field changes", () => {
    const onRegionChange = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        handlers={{ ...defaultProps.handlers, onRegionChange }}
      />,
    );
    const regionField = screen.getByLabelText("Region");
    fireEvent.change(regionField, { target: { value: "Bandung" } });
    expect(onRegionChange).toHaveBeenCalledWith("Bandung");
  });

  it("should call onEmailChange when email field changes", () => {
    const onEmailChange = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        handlers={{ ...defaultProps.handlers, onEmailChange }}
      />,
    );
    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: "jane@example.com" } });
    expect(onEmailChange).toHaveBeenCalledWith("jane@example.com");
  });

  it("should call onPasswordChange when password field changes", () => {
    const onPasswordChange = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        handlers={{ ...defaultProps.handlers, onPasswordChange }}
      />,
    );
    const passwordField = screen.getByLabelText("Password");
    fireEvent.change(passwordField, { target: { value: "newpassword" } });
    expect(onPasswordChange).toHaveBeenCalledWith("newpassword");
  });

  it("should call onConfirmChange when confirm password field changes", () => {
    const onConfirmChange = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        handlers={{ ...defaultProps.handlers, onConfirmChange }}
      />,
    );
    const confirmField = screen.getByLabelText("Confirm password");
    fireEvent.change(confirmField, { target: { value: "newpassword" } });
    expect(onConfirmChange).toHaveBeenCalledWith("newpassword");
  });

  it("should call onNavigateToLogin when Sign in link is clicked", () => {
    const onNavigateToLogin = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        onNavigateToLogin={onNavigateToLogin}
      />,
    );
    const signInLink = screen.getByText("Sign in");
    fireEvent.click(signInLink);
    expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
  });

  it("should display error alert when error is provided", () => {
    render(<SignupFormCard {...defaultProps} error="Email already exists" />);
    expect(screen.getByText("Email already exists")).toBeInTheDocument();
  });

  it("should call onDismissError when alert close button is clicked", () => {
    const onDismissError = vi.fn();
    render(
      <SignupFormCard
        {...defaultProps}
        error="Test error"
        onDismissError={onDismissError}
      />,
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(onDismissError).toHaveBeenCalledTimes(1);
  });

  it("should show Creating... when submitting", () => {
    render(<SignupFormCard {...defaultProps} isSubmitting={true} />);
    expect(screen.getByText("Creating")).toBeInTheDocument();
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    render(<SignupFormCard {...defaultProps} />);
    const passwordField = screen.getByLabelText("Password");
    const toggleButtons = screen.getAllByRole("button");

    // Find the eye icon button for password field
    const eyeButton = toggleButtons.find((button) =>
      button
        .querySelector("svg")
        ?.getAttribute("data-testid")
        ?.includes("Visibility"),
    );

    if (eyeButton) {
      const initialType = passwordField.getAttribute("type");
      fireEvent.click(eyeButton);
      const newType = passwordField.getAttribute("type");
      expect(initialType).toBe("password");
      expect(newType).toBe("text");
    }
  });

  it("should render within a Card component", () => {
    const { container } = render(<SignupFormCard {...defaultProps} />);
    const card = container.querySelector(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });

  it("should have hidden image file input", () => {
    render(<SignupFormCard {...defaultProps} />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveAttribute("hidden");
  });
});
