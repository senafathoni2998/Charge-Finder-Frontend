import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditCarNotFound from '../EditCarNotFound';

describe('EditCarNotFound', () => {
    it('should render "Car not found" message', () => {
        render(<EditCarNotFound onBack={vi.fn()} />);

        expect(screen.getByText('Car not found.')).toBeInTheDocument();
    });

    it('should render subtitle message', () => {
        render(<EditCarNotFound onBack={vi.fn()} />);

        expect(screen.getByText(/Head back to your profile/)).toBeInTheDocument();
    });

    it('should render full subtitle text', () => {
        render(<EditCarNotFound onBack={vi.fn()} />);

        expect(screen.getByText('Head back to your profile to choose a different car.')).toBeInTheDocument();
    });

    it('should render "Back to profile" button', () => {
        render(<EditCarNotFound onBack={vi.fn()} />);

        expect(screen.getByText('Back to profile')).toBeInTheDocument();
    });

    it('should call onBack when button is clicked', () => {
        const onBack = vi.fn();
        render(<EditCarNotFound onBack={onBack} />);

        fireEvent.click(screen.getByText('Back to profile'));
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
