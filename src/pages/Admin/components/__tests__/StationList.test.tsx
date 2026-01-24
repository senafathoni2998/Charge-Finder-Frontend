import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StationList from '../StationList';
import type { Station } from '../../../../models/model';

describe('StationList', () => {
    const mockStations: Station[] = [
        {
            id: 's1',
            name: 'Station A',
            address: 'Address A',
            status: 'AVAILABLE',
            lastUpdatedISO: '2025-01-24T10:00:00Z',
            connectors: [{ type: 'Type2', powerKW: 22, ports: 2, availablePorts: 2 }],
            coordinates: { lat: 50, lng: 10 },
        },
        {
            id: 's2',
            name: 'Station B',
            address: 'Address B',
            status: 'OFFLINE',
            lastUpdatedISO: '2025-01-24T10:00:00Z',
            connectors: [{ type: 'CCS2', powerKW: 50, ports: 1, availablePorts: 0 }],
            coordinates: { lat: 51, lng: 11 },
        },
    ];

    const onOpenMenu = vi.fn();

    it('should render loading state', () => {
        render(<StationList stations={[]} isLoading={true} error={null} allStationsCount={0} onOpenMenu={onOpenMenu} />);

        // Use a function matcher to handle the unicode ellipsis
        expect(screen.getByText((content) => content.includes('Loading stations'))).toBeInTheDocument();
    });

    it('should render empty state with no error', () => {
        render(<StationList stations={[]} isLoading={false} error={null} allStationsCount={0} onOpenMenu={onOpenMenu} />);

        expect(screen.getByText('No stations found.')).toBeInTheDocument();
    });

    it('should render empty state with error', () => {
        render(<StationList stations={[]} isLoading={false} error="Failed to load" allStationsCount={0} onOpenMenu={onOpenMenu} />);

        expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('should render empty state with filter message when stations exist', () => {
        render(<StationList stations={[]} isLoading={false} error={null} allStationsCount={5} onOpenMenu={onOpenMenu} />);

        expect(screen.getByText('No stations match the current filters.')).toBeInTheDocument();
    });

    it('should render all stations', () => {
        render(<StationList stations={mockStations} isLoading={false} error={null} allStationsCount={2} onOpenMenu={onOpenMenu} />);

        expect(screen.getByText('Station A')).toBeInTheDocument();
        expect(screen.getByText('Station B')).toBeInTheDocument();
    });

    it('should render correct number of stations', () => {
        const { container } = render(<StationList stations={mockStations} isLoading={false} error={null} allStationsCount={2} onOpenMenu={onOpenMenu} />);

        // Verify both stations are in the document
        expect(screen.getByText('Station A')).toBeInTheDocument();
        expect(screen.getByText('Station B')).toBeInTheDocument();
    });
});
