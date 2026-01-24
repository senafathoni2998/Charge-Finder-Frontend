import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditCarHeader from '../EditCarHeader';

describe('EditCarHeader', () => {
    it('should render title "Edit car"', () => {
        render(<EditCarHeader />);

        expect(screen.getByText('Edit car')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
        render(<EditCarHeader />);

        expect(screen.getByText(/Update your connector types/)).toBeInTheDocument();
    });

    it('should render full subtitle text', () => {
        render(<EditCarHeader />);

        expect(screen.getByText('Update your connector types to keep station matches accurate.')).toBeInTheDocument();
    });
});
