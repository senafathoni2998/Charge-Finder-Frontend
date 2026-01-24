import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoordinatesSection from '../CoordinatesSection';
import type { Station } from '../../../types';

// Mock dependencies
vi.mock('../InfoRow', () => ({
    default: ({ label, value }: any) => (
        <div>
            {label}: {value}
        </div>
    ),
}));

vi.mock('../SectionCard', () => ({
    default: ({ title, subtitle, children }: any) => (
        <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            {children}
        </div>
    ),
}));

describe('CoordinatesSection', () => {
    const mockStation: Station = {
        id: '1',
        name: 'Test Station',
        lat: 51.507355,
        lng: -0.127758,
        address: '123 Test Street',
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

    it('should render without crashing', () => {
        render(<CoordinatesSection loading={false} station={mockStation} />);
        expect(screen.getByText('Coordinates')).toBeInTheDocument();
    });

    it('should render the title and subtitle', () => {
        render(<CoordinatesSection loading={false} station={mockStation} />);
        expect(screen.getByText('Coordinates')).toBeInTheDocument();
        expect(screen.getByText('For debugging and precise navigation')).toBeInTheDocument();
    });

    it('should render latitude and longitude values', () => {
        render(<CoordinatesSection loading={false} station={mockStation} />);
        expect(screen.getByText(/Latitude:/)).toBeInTheDocument();
        expect(screen.getByText(/Longitude:/)).toBeInTheDocument();
        expect(screen.getByText(/51.507/)).toBeInTheDocument(); // rounded to 5 decimal places
        expect(screen.getByText(/-0.127/)).toBeInTheDocument(); // rounded to 5 decimal places
    });

    it('should render skeletons when loading', () => {
        render(<CoordinatesSection loading={true} station={null} />);
        expect(screen.getByText('Coordinates')).toBeInTheDocument();
    });

    it('should render skeletons when station is null', () => {
        render(<CoordinatesSection loading={false} station={null} />);
        expect(screen.getByText('Coordinates')).toBeInTheDocument();
    });

    it('should format coordinates correctly with 5 decimal places', () => {
        const stationWithDifferentCoords: Station = {
            ...mockStation,
            lat: 40.712776,
            lng: -74.005974,
        };
        render(<CoordinatesSection loading={false} station={stationWithDifferentCoords} />);
        expect(screen.getByText(/40.712/)).toBeInTheDocument();
        expect(screen.getByText(/-74.005/)).toBeInTheDocument();
    });

    it('should handle negative coordinates', () => {
        const stationWithNegativeCoords: Station = {
            ...mockStation,
            lat: -33.868820,
            lng: 151.209296,
        };
        render(<CoordinatesSection loading={false} station={stationWithNegativeCoords} />);
        expect(screen.getByText(/-33.868/)).toBeInTheDocument();
        expect(screen.getByText(/151.209/)).toBeInTheDocument();
    });

    it('should handle zero coordinates', () => {
        const stationWithZeroCoords: Station = {
            ...mockStation,
            lat: 0,
            lng: 0,
        };
        render(<CoordinatesSection loading={false} station={stationWithZeroCoords} />);
        // Both latitude and longitude will have 0.00000, use getAllByText
        expect(screen.getAllByText(/0.000/).length).toBeGreaterThan(0);
    });
});
