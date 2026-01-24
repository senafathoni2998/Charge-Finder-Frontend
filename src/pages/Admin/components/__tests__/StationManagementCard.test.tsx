import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationManagementCard from '../StationManagementCard';
import type { Station } from '../../../../models/model';
import type { StationFilterStatus } from '../../types';
import type { ConnectorType } from '../../../../models/model';

vi.mock('../StationFiltersPanel', () => ({
    default: ({ open, onResetFilters, filtersActiveCount }: any) =>
        open ? (
            <div data-testid="filters-panel">
                <button onClick={onResetFilters} disabled={!filtersActiveCount}>
                    Reset
                </button>
            </div>
        ) : null,
}));

vi.mock('../StationList', () => ({
    default: ({ stations, isLoading, onOpenMenu }: any) =>
        isLoading ? (
            <div>Loading...</div>
        ) : (
            <div data-testid="station-list">
                {stations.map((s: Station) => (
                    <div key={s.id}>{s.name}</div>
                ))}
                <button onClick={(e) => onOpenMenu(e, stations[0])}>Open Menu</button>
            </div>
        ),
}));

describe('StationManagementCard', () => {
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
    ];

    const defaultProps = {
        query: '',
        onQueryChange: vi.fn(),
        filtersOpen: false,
        onToggleFilters: vi.fn(),
        filtersActiveCount: 0,
        statusFilter: '' as StationFilterStatus,
        onStatusFilterChange: vi.fn(),
        connectorSet: new Set<ConnectorType>(),
        onToggleConnector: vi.fn(),
        minKW: 0,
        onMinKWChange: vi.fn(),
        onResetFilters: vi.fn(),
        stationActionError: null,
        stationsLoading: false,
        stationsError: null,
        filteredStations: mockStations,
        allStationsCount: 1,
        onOpenMenu: vi.fn(),
        onNewStation: vi.fn(),
    };

    it('should render title and description', () => {
        render(<StationManagementCard {...defaultProps} />);

        expect(screen.getByText('Station management')).toBeInTheDocument();
        expect(screen.getByText(/Review availability, edit details, and resolve issues/)).toBeInTheDocument();
    });

    it('should render search input', () => {
        render(<StationManagementCard {...defaultProps} />);

        expect(screen.getByPlaceholderText('Search stations, IDs, or cities')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
        render(<StationManagementCard {...defaultProps} />);

        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByText('New station')).toBeInTheDocument();
    });

    it('should render filters button with active count', () => {
        render(<StationManagementCard {...defaultProps} filtersActiveCount={2} />);

        expect(screen.getByText('Filters (2)')).toBeInTheDocument();
    });

    it('should call onToggleFilters when Filters button is clicked', () => {
        const onToggleFilters = vi.fn();
        render(<StationManagementCard {...defaultProps} onToggleFilters={onToggleFilters} />);

        fireEvent.click(screen.getByText('Filters'));
        expect(onToggleFilters).toHaveBeenCalledTimes(1);
    });

    it('should call onNewStation when New station button is clicked', () => {
        const onNewStation = vi.fn();
        render(<StationManagementCard {...defaultProps} onNewStation={onNewStation} />);

        fireEvent.click(screen.getByText('New station'));
        expect(onNewStation).toHaveBeenCalledTimes(1);
    });

    it('should call onQueryChange when search input changes', () => {
        const onQueryChange = vi.fn();
        render(<StationManagementCard {...defaultProps} onQueryChange={onQueryChange} />);

        const input = screen.getByPlaceholderText('Search stations, IDs, or cities');
        fireEvent.change(input, { target: { value: 'test query' } });

        expect(onQueryChange).toHaveBeenCalledWith('test query');
    });

    it('should render filters panel when open', () => {
        render(<StationManagementCard {...defaultProps} filtersOpen={true} />);

        expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    });

    it('should not render filters panel when closed', () => {
        render(<StationManagementCard {...defaultProps} filtersOpen={false} />);

        expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    });

    it('should render error message when station action error exists', () => {
        render(<StationManagementCard {...defaultProps} stationActionError="Failed to delete station" />);

        expect(screen.getByText('Failed to delete station')).toBeInTheDocument();
    });

    it('should render station list', () => {
        render(<StationManagementCard {...defaultProps} />);

        expect(screen.getByText('Station A')).toBeInTheDocument();
    });
});
