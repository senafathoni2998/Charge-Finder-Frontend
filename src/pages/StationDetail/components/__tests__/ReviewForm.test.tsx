import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewForm from "../ReviewForm";

describe("ReviewForm", () => {
  it("renders the write title and disables submit until a rating is chosen", () => {
    render(<ReviewForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Write a review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit review" })).toBeDisabled();
  });

  it("submits the chosen rating and trimmed comment", () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByLabelText("4 Stars"));
    fireEvent.change(screen.getByLabelText("Review comment"), {
      target: { value: "  Solid stop  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    expect(onSubmit).toHaveBeenCalledWith({ rating: 4, comment: "Solid stop" });
  });

  it("shows edit mode with an Update button and a Delete action", () => {
    const onDelete = vi.fn();
    render(
      <ReviewForm
        isEditing
        initialRating={5}
        initialComment="Great"
        onSubmit={vi.fn()}
        onDelete={onDelete}
      />
    );
    expect(screen.getByText("Your review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update review" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders a server error (e.g. the eligibility message)", () => {
    render(
      <ReviewForm
        onSubmit={vi.fn()}
        error="You can only review a station after completing a charging session there."
      />
    );
    expect(
      screen.getByText(/completing a charging session/)
    ).toBeInTheDocument();
  });

  it("shows a saving label while submitting", () => {
    render(<ReviewForm initialRating={4} submitting onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
