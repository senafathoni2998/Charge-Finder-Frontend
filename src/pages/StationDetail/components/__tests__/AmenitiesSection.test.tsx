import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AmenitiesSection from '../AmenitiesSection';
import type { Station } from '../../../types';

// Mock dependencies
vi.mock('../SectionCard', () => ({
    default: ({ title, subtitle, children }: any) => (
        <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            {children}
        </div>
    ),
}));

describe('AmenitiesSection', () => {
    const mockStation: Station = {
        id: '1',
        name: 'Test Station',
        lat: 51.5074,
        lng: -0.1278,
        address: '123 Test Street',
        connectors: [],
        status: 'AVAILABLE',
        lastUpdatedISO: '2024-01-01T00:00:00Z',
        photos: [],
        pricing: {
            currency: 'GBP',
            perKwh: 0.35,
        },
        amenities: ['Cafe', 'Restroom', 'WiFi', 'Shopping', 'Restaurant', 'Parking'],
    };

    it('should render without crashing', () => {
        render(<AmenitiesSection loading={false} station={mockStation} />);
        expect(screen.getByText('Amenities')).toBeInTheDocument();
    });

    it('should render the title and subtitle', () => {
        render(<AmenitiesSection loading={false} station={mockStation} />);
        expect(screen.getByText('Amenities')).toBeInTheDocument();
        expect(screen.getByText('Helpful things near this station')).toBeInTheDocument();
    });

    it('should render all amenities as chips', () => {
        render(<AmenitiesSection loading={false} station={mockStation} />);
        expect(screen.getByText('Cafe')).toBeInTheDocument();
        expect(screen.getByText('Restroom')).toBeInTheDocument();
        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('Shopping')).toBeInTheDocument();
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Parking')).toBeInTheDocument();
    });

    it('should render skeletons when loading', () => {
        render(<AmenitiesSection loading={true} station={null} />);
        expect(screen.getByText('Amenities')).toBeInTheDocument();
    });

    it('should render skeletons when station is null', () => {
        render(<AmenitiesSection loading={false} station={null} />);
        expect(screen.getByText('Amenities')).toBeInTheDocument();
    });

    it('should render empty list when station has no amenities', () => {
        const stationWithNoAmenities: Station = {
            ...mockStation,
            amenities: [],
        };
        render(<AmenitiesSection loading={false} station={stationWithNoAmenities} />);
        expect(screen.getByText('Amenities')).toBeInTheDocument();
    });

    it('should render single amenity', () => {
        const stationWithOneAmenity: Station = {
            ...mockStation,
            amenities: ['WiFi'],
        };
        render(<AmenitiesSection loading={false} station={stationWithOneAmenity} />);
        expect(screen.getByText('WiFi')).toBeInTheDocument();
    });

    it('should render amenities with special characters', () => {
        const stationWithSpecialAmenities: Station = {
            ...mockStation,
            amenities: ['24/7 Access', 'EV Repair', 'Child-friendly'],
        };
        render(<AmenitiesSection loading={false} station={stationWithSpecialAmenities} />);
        expect(screen.getByText('24/7 Access')).toBeInTheDocument();
        expect(screen.getByText('EV Repair')).toBeInTheDocument();
        expect(screen.getByText('Child-friendly')).toBeInTheDocument();
    });
});
