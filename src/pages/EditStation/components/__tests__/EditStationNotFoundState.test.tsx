import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditStationNotFoundState from '../EditStationNotFoundState';

describe('EditStationNotFoundState', () => {
    it('should render default "Station not found" message', () => {
        render(<EditStationNotFoundState onBack={vi.fn()} />);

        expect(screen.getByText('Station not found.')).toBeInTheDocument();
    });

    it('should render custom error message when provided', () => {
        render(
            <EditStationNotFoundState errorMessage="Custom error message" onBack={vi.fn()} />
        );

        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should render subtitle message', () => {
        render(<EditStationNotFoundState onBack={vi.fn()} />);

        expect(screen.getByText(/Head back to the admin console/)).toBeInTheDocument();
    });

    it('should render "Back to admin" button', () => {
        render(<EditStationNotFoundState onBack={vi.fn()} />);

        expect(screen.getByText('Back to admin')).toBeInTheDocument();
    });

    it('should call onBack when button is clicked', () => {
        const onBack = vi.fn();
        render(<EditStationNotFoundState onBack={onBack} />);

        fireEvent.click(screen.getByText('Back to admin'));
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
