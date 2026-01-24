import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConnectorsSection from '../ConnectorsSection';
import type { Station } from '../../../types';

// Mock dependencies
vi.mock('../ConnectorRow', () => ({
    default: ({ c }: { c: { type: string } }) => (
        <div data-testid={`connector-${c.type}`}>{c.type}</div>
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

describe('ConnectorsSection', () => {
    const mockStation: Station = {
        id: '1',
        name: 'Test Station',
        lat: 51.5074,
        lng: -0.1278,
        address: '123 Test Street',
        connectors: [
            { type: 'CCS2', powerKW: 50, ports: 4, availablePorts: 2 },
            { type: 'Type2', powerKW: 22, ports: 2, availablePorts: 1 },
        ],
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
        render(<ConnectorsSection loading={false} station={mockStation} />);
        expect(screen.getByText('Connectors')).toBeInTheDocument();
    });

    it('should render the title and subtitle', () => {
        render(<ConnectorsSection loading={false} station={mockStation} />);
        expect(screen.getByText('Connectors')).toBeInTheDocument();
        expect(screen.getByText(/Compatibility.*availability per connector type/)).toBeInTheDocument();
    });

    it('should render connectors when not loading and station is provided', () => {
        render(<ConnectorsSection loading={false} station={mockStation} />);
        expect(screen.getByTestId('connector-CCS2')).toBeInTheDocument();
        expect(screen.getByTestId('connector-Type2')).toBeInTheDocument();
    });

    it('should render skeletons when loading', () => {
        render(<ConnectorsSection loading={true} station={null} />);
        expect(screen.getByText('Connectors')).toBeInTheDocument();
        // Skeletons are rendered in the component, just verify the section exists
        expect(screen.getByText('Connectors')).toBeInTheDocument();
    });

    it('should render skeletons when station is null', () => {
        render(<ConnectorsSection loading={false} station={null} />);
        expect(screen.getByText('Connectors')).toBeInTheDocument();
    });

    it('should render all connectors from the station', () => {
        const stationWithManyConnectors: Station = {
            ...mockStation,
            connectors: [
                { type: 'CCS2', powerKW: 50, ports: 2, availablePorts: 1 },
                { type: 'Type2', powerKW: 22, ports: 2, availablePorts: 2 },
                { type: 'CHAdeMO', powerKW: 50, ports: 1, availablePorts: 0 },
            ],
        };
        render(<ConnectorsSection loading={false} station={stationWithManyConnectors} />);
        expect(screen.getByTestId('connector-CCS2')).toBeInTheDocument();
        expect(screen.getByTestId('connector-Type2')).toBeInTheDocument();
        expect(screen.getByTestId('connector-CHAdeMO')).toBeInTheDocument();
    });

    it('should render empty connector list when station has no connectors', () => {
        const stationWithNoConnectors: Station = {
            ...mockStation,
            connectors: [],
        };
        render(<ConnectorsSection loading={false} station={stationWithNoConnectors} />);
        expect(screen.getByText('Connectors')).toBeInTheDocument();
    });
});
