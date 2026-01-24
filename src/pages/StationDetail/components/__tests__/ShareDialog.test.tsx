import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareDialog from '../ShareDialog';
import type { Station } from '../../../types';

describe('ShareDialog', () => {
    const mockStation: Station = {
        id: '1',
        name: 'Test Charging Station',
        lat: 51.5074,
        lng: -0.1278,
        address: '123 Test Street, London, UK',
        connectors: [],
        status: 'AVAILABLE',
        lastUpdatedISO: '2024-01-01T00:00:00Z',
        photos: [],
        pricing: {
            currency: 'GBP',
            perKwh: 0.35,
        },
        amenities: [],
    };

    const mockProps = {
        open: true,
        onClose: vi.fn(),
        station: mockStation,
    };

    it('should render without crashing', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<ShareDialog {...mockProps} open={false} />);
        expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });

    it('should render title', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should render description message', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByText(/Your browser doesn.*support native share/)).toBeInTheDocument();
    });

    it('should render station name', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByText('Test Charging Station')).toBeInTheDocument();
    });

    it('should render station address', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByText('123 Test Street, London, UK')).toBeInTheDocument();
    });

    it('should render done button', () => {
        render(<ShareDialog {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    it('should call onClose when done button is clicked', () => {
        render(<ShareDialog {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should render placeholder when station is null', () => {
        render(<ShareDialog {...mockProps} station={null} />);
        expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('should render empty string when station name is empty', () => {
        const stationWithoutName: Station = {
            ...mockStation,
            name: '',
        };
        render(<ShareDialog {...mockProps} station={stationWithoutName} />);
        // Empty string is rendered as is when using ?? operator
        expect(screen.getByText('123 Test Street, London, UK')).toBeInTheDocument();
    });

    it('should render empty string when station address is empty', () => {
        const stationWithoutAddress: Station = {
            ...mockStation,
            address: '',
        };
        render(<ShareDialog {...mockProps} station={stationWithoutAddress} />);
        // Empty string is rendered as is when using ?? operator
        expect(screen.getByText('Test Charging Station')).toBeInTheDocument();
    });
});
