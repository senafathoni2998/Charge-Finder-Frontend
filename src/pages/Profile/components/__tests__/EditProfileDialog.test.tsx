import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditProfileDialog from "../EditProfileDialog";

type Overrides = Partial<React.ComponentProps<typeof EditProfileDialog>>;

function renderDialog(overrides: Overrides = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    email: "jane@example.com",
    initialName: "Jane Doe",
    initialRegion: "Jakarta",
    serverError: null,
    onDismissError: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<EditProfileDialog {...props} />);
  return props;
}

describe("EditProfileDialog", () => {
  it("renders the dialog when open", () => {
    renderDialog();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderDialog({ open: false });
    expect(screen.queryByText("Edit profile")).not.toBeInTheDocument();
  });

  it("pre-fills the name + region and disables the email", () => {
    renderDialog();
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Jane Doe");
    expect(screen.getByLabelText("Region")).toHaveValue("Jakarta");
    const emailField = screen.getByLabelText("Email");
    expect(emailField).toHaveValue("jane@example.com");
    expect(emailField).toBeDisabled();
  });

  it("renders the photo section, upload button + hidden file input", () => {
    renderDialog();
    expect(screen.getByText("Profile photo (optional)")).toBeInTheDocument();
    expect(screen.getByText("Upload photo")).toBeInTheDocument();
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute("hidden");
  });

  it("shows the server error alert + calls onDismissError on close", () => {
    const props = renderDialog({ serverError: "Could not update profile." });
    expect(screen.getByText("Could not update profile.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(props.onDismissError).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", () => {
    const props = renderDialog();
    fireEvent.click(screen.getByText("Cancel"));
    expect(props.onClose).toHaveBeenCalled();
  });

  it("submits the values + image (null) on Save changes", async () => {
    const props = renderDialog();
    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith(
        { name: "Jane Doe", region: "Jakarta" },
        null,
      ),
    );
  });

  it("blocks submit + shows an error when the name is empty", async () => {
    const props = renderDialog({ initialName: "" });
    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() =>
      expect(screen.getByText("Name is required.")).toBeInTheDocument(),
    );
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
