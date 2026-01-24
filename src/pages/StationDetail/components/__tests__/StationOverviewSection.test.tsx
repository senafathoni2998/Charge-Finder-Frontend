import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationOverviewSection from '../StationOverviewSection';
import type { Station } from '../../../types';
import type { UserCar } from '../../../../features/auth/authSlice';

// Mock dependencies
vi.mock('../SectionCard', () => ({
    default: ({ title, subtitle, right, children }: any) => (
        <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <div data-testid="right-element">{right}</div>
            {children}
        </div>
    ),
}));

vi.mock('../../MainPage/components/StatusChip', () => ({
    default: () => <span>Chip Status</span>,
}));

vi.mock('../MiniPhoto', () => ({
    default: ({ label }: { label: string }) => (
        <div data-testid={`photo-${label}`}>{label}</div>
    ),
}));

vi.mock('../../../../utils/time', () => ({
    minutesAgo: () => 15,
}));

describe('StationOverviewSection', () => {
    const mockStation: Station = {
        id: '1',
        name: 'Test Charging Station',
        lat: 51.5074,
        lng: -0.1278,
        address: '123 Test Street, London',
        connectors: [
            { type: 'CCS2', powerKW: 50, ports: 4, availablePorts: 2 },
        ],
        status: 'AVAILABLE',
        lastUpdatedISO: '2024-01-01T00:00:00Z',
        photos: [
            { label: 'Front view', gradient: 'linear-gradient(45deg, red, blue)' },
            { label: 'Side view', gradient: 'linear-gradient(45deg, green, yellow)' },
            { label: 'Connector', gradient: 'linear-gradient(45deg, orange, purple)' },
        ],
        pricing: {
            currency: 'GBP',
            perKwh: 0.35,
        },
        amenities: ['Cafe', 'WiFi'],
        notes: 'Located near parking entrance',
    };

    const mockActiveCar: UserCar = {
        id: 'car1',
        name: 'Tesla Model 3',
        connectorTypes: ['CCS2', 'Type2'],
        minKW: 50,
        batteryCapacity: 75,
    };

    const mockProps = {
        loading: false,
        station: mockStation,
        activeCar: mockActiveCar,
        isCompatible: true,
        distanceKm: 5.2,
        onReportIssue: vi.fn(),
    };

    it('should render without crashing', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('Test Charging Station')).toBeInTheDocument();
    });

    it('should render loading state', () => {
        render(<StationOverviewSection {...mockProps} loading={true} />);
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('should render station name and address', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('Test Charging Station')).toBeInTheDocument();
        expect(screen.getByText('123 Test Street, London')).toBeInTheDocument();
    });

    it('should render status chip', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('Chip Status')).toBeInTheDocument();
    });

    it('should render compatible chip when car is compatible', () => {
        render(<StationOverviewSection {...mockProps} isCompatible={true} />);
        expect(screen.getByText('Compatible')).toBeInTheDocument();
    });

    it('should render not supported chip when car is not compatible', () => {
        render(<StationOverviewSection {...mockProps} isCompatible={false} />);
        expect(screen.getByText('Not supported')).toBeInTheDocument();
    });

    it('should not render compatibility chip when no active car', () => {
        render(<StationOverviewSection {...mockProps} activeCar={null} />);
        expect(screen.queryByText('Compatible')).not.toBeInTheDocument();
        expect(screen.queryByText('Not supported')).not.toBeInTheDocument();
    });

    it('should not render compatibility chip when car has no connector types', () => {
        const carWithoutConnectors: UserCar = {
            id: 'car1',
            name: 'Tesla Model 3',
            connectorTypes: [],
            minKW: 50,
            batteryCapacity: 75,
        };
        render(<StationOverviewSection {...mockProps} activeCar={carWithoutConnectors} />);
        expect(screen.queryByText('Compatible')).not.toBeInTheDocument();
    });

    it('should render all three photos', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('Front view')).toBeInTheDocument();
        expect(screen.getByText('Side view')).toBeInTheDocument();
        expect(screen.getByText('Connector')).toBeInTheDocument();
    });

    it('should render distance chip', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('5.2 km away')).toBeInTheDocument();
    });

    it('should render updated chip', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument();
    });

    it('should render report issue button', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Report issue' })).toBeInTheDocument();
    });

    it('should call onReportIssue when report button is clicked', () => {
        render(<StationOverviewSection {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Report issue' }));
        expect(mockProps.onReportIssue).toHaveBeenCalled();
    });

    it('should render notes when present', () => {
        render(<StationOverviewSection {...mockProps} />);
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Located near parking entrance')).toBeInTheDocument();
    });

    it('should not render notes when absent', () => {
        const stationWithoutNotes: Station = {
            ...mockStation,
            notes: undefined,
        };
        render(<StationOverviewSection {...mockProps} station={stationWithoutNotes} />);
        expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    });

    it('should render placeholder for missing photos', () => {
        const stationWithMissingPhotos: Station = {
            ...mockStation,
            photos: [
                { label: 'Front view', gradient: 'linear-gradient(45deg, red, blue)' },
            ],
        };
        render(<StationOverviewSection {...mockProps} station={stationWithMissingPhotos} />);
        expect(screen.getByText('Front view')).toBeInTheDocument();
        expect(screen.getAllByText('Photo').length).toBeGreaterThanOrEqual(1);
    });

    it('should render dash when distanceKm is null', () => {
        render(<StationOverviewSection {...mockProps} distanceKm={null} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render default title when station is null', () => {
        render(<StationOverviewSection {...mockProps} station={null} />);
        expect(screen.getByText('Station')).toBeInTheDocument();
    });
});
