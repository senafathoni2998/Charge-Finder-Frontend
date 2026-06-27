import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangePasswordDialog from "../ChangePasswordDialog";

type Overrides = Partial<React.ComponentProps<typeof ChangePasswordDialog>>;

function renderDialog(overrides: Overrides = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    serverError: null,
    onDismissError: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<ChangePasswordDialog {...props} />);
  return props;
}

const fillValid = () => {
  fireEvent.change(screen.getByLabelText("Current password"), {
    target: { value: "oldpass1" },
  });
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: "newpass1" },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: "newpass1" },
  });
};

describe("ChangePasswordDialog", () => {
  it("renders the dialog when open", () => {
    renderDialog();
    expect(screen.getByText("Change password")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderDialog({ open: false });
    expect(screen.queryByText("Change password")).not.toBeInTheDocument();
  });

  it("renders the three password fields + the requirements hint", () => {
    renderDialog();
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(
      screen.getByText("Use 8+ characters, letters, and numbers."),
    ).toBeInTheDocument();
  });

  it("shows the server error alert + calls onDismissError on close", () => {
    const props = renderDialog({ serverError: "Wrong password." });
    expect(screen.getByText("Wrong password.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(props.onDismissError).toHaveBeenCalled();
  });

  it("shows the strength chip once the new password has a value", () => {
    renderDialog();
    expect(screen.queryByText(/Strength:/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpass1" },
    });
    expect(screen.getByText(/Strength:/)).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const props = renderDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("submits the values on a valid Update password", async () => {
    const props = renderDialog();
    fillValid();
    fireEvent.click(screen.getByText("Update password"));

    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith({
        currentPassword: "oldpass1",
        newPassword: "newpass1",
        confirmPassword: "newpass1",
      }),
    );
  });

  it("blocks submit + shows an error for a weak new password", async () => {
    const props = renderDialog();
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "oldpass1" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "weak" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "weak" },
    });
    fireEvent.click(screen.getByText("Update password"));

    await waitFor(() =>
      expect(
        screen.getByText("Password must be at least 7 characters."),
      ).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit + shows a mismatch error", async () => {
    const props = renderDialog();
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "oldpass1" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpass1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different1" },
    });
    fireEvent.click(screen.getByText("Update password"));

    await waitFor(() =>
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit when the new password matches the current", async () => {
    const props = renderDialog();
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "newpass1" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpass1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newpass1" },
    });
    fireEvent.click(screen.getByText("Update password"));

    await waitFor(() =>
      expect(
        screen.getByText("New password must be different."),
      ).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
