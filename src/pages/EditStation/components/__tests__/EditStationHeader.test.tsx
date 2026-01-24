import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditStationHeader from '../EditStationHeader';

describe('EditStationHeader', () => {
    it('should render title "Edit station"', () => {
        render(<EditStationHeader />);

        expect(screen.getByText('Edit station')).toBeInTheDocument();
    });

    it('should render default subtitle', () => {
        render(<EditStationHeader />);

        expect(screen.getByText('Update station details and keep the network accurate.')).toBeInTheDocument();
    });

    it('should render custom subtitle when provided', () => {
        render(<EditStationHeader subtitle="Custom subtitle text" />);

        expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();
    });
});
