import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "../StarRating";

describe("StarRating", () => {
  it("renders a MUI rating element", () => {
    const { container } = render(<StarRating value={4} />);
    expect(container.querySelector(".MuiRating-root")).toBeTruthy();
  });

  it("shows the numeric average when showValue is set", () => {
    render(<StarRating value={4.5} showValue />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders 0.0 for a nullish value when showValue is set", () => {
    render(<StarRating value={null} showValue />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("shows the count in parentheses when provided", () => {
    render(<StarRating value={3} count={12} />);
    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("omits the count when not provided", () => {
    render(<StarRating value={3} />);
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });
});
