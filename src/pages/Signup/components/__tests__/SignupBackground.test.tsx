import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignupBackground from '../SignupBackground';

describe('SignupBackground', () => {
    it('should render without crashing', () => {
        const { container } = render(<SignupBackground />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should have aria-hidden attribute', () => {
        const { container } = render(<SignupBackground />);
        expect(container.firstChild).toHaveAttribute('aria-hidden');
    });

    it('should render gradient circles', () => {
        const { container } = render(<SignupBackground />);
        const circles = container.querySelectorAll('[aria-hidden="true"] > div');
        expect(circles.length).toBeGreaterThan(0);
    });

    it('should have correct positioning styles', () => {
        const { container } = render(<SignupBackground />);
        const backgroundBox = container.firstChild as HTMLElement;
        expect(backgroundBox).toHaveStyle({
            position: 'absolute',
            inset: 0,
        });
    });

    it('should have pointerEvents none', () => {
        const { container } = render(<SignupBackground />);
        const backgroundBox = container.firstChild as HTMLElement;
        expect(backgroundBox).toHaveStyle({
            pointerEvents: 'none',
        });
    });
});
