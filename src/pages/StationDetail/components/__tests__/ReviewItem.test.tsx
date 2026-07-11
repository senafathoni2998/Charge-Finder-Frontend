import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewItem from "../ReviewItem";
import type { StationReview } from "../../../../models/model";

const baseReview: StationReview = {
  id: "r1",
  station: "s1",
  user: { id: "u1", name: "Dina", image: null },
  rating: 4,
  comment: "Fast and clean.",
  createdAt: "2026-05-01T10:00:00.000Z",
  updatedAt: "2026-05-01T10:00:00.000Z",
};

describe("ReviewItem", () => {
  it("renders the reviewer name and comment", () => {
    render(<ReviewItem review={baseReview} />);
    expect(screen.getByText("Dina")).toBeInTheDocument();
    expect(screen.getByText("Fast and clean.")).toBeInTheDocument();
  });

  it("shows a 'You' chip for the caller's own review", () => {
    render(<ReviewItem review={baseReview} isOwn />);
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("does not show the 'You' chip otherwise", () => {
    render(<ReviewItem review={baseReview} />);
    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("falls back to Anonymous when the reviewer has no name", () => {
    render(
      <ReviewItem review={{ ...baseReview, user: { id: "u1", name: null, image: null } }} />
    );
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("renders a delete button and calls onDelete when canDelete", () => {
    const onDelete = vi.fn();
    render(<ReviewItem review={baseReview} canDelete onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(baseReview);
  });

  it("hides the delete button when canDelete is false", () => {
    render(<ReviewItem review={baseReview} />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });
});
