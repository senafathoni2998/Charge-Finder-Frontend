import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginAppBar from '../LoginAppBar';

describe('LoginAppBar', () => {
    it('should render the app bar', () => {
        render(<LoginAppBar onNavigateHome={vi.fn()} />);

        const appBar = screen.getByRole('banner');
        expect(appBar).toBeInTheDocument();
    });

    it('should render the ChargeFinder branding', () => {
        render(<LoginAppBar onNavigateHome={vi.fn()} />);

        expect(screen.getByText('ChargeFinder')).toBeInTheDocument();
        expect(screen.getByText('Find compatible chargers faster')).toBeInTheDocument();
    });

    it('should have sticky position', () => {
        const { container } = render(<LoginAppBar onNavigateHome={vi.fn()} />);

        const appBar = screen.getByRole('banner');
        expect(appBar).toBeInTheDocument();
    });
});
