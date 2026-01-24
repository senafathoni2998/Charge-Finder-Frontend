import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapPanel from '../MapPanel';
import type { StationWithDistance, StationBounds } from '../../types';

const mockStations: StationWithDistance[] = [
    {
        id: 'station-1',
        name: 'Test Station 1',
        address: '123 Test St',
        lat: 40.7128,
        lng: -74.006,
        status: 'AVAILABLE',
        isChargingHere: false,
        connectors: [{ type: 'CCS2', powerKW: 150 }],
        distanceKm: 5.5,
        lastUpdatedISO: new Date().toISOString(),
    },
];

const mockBounds: StationBounds = {
    minLat: 40.7,
    maxLat: 40.8,
    minLng: -74.1,
    maxLng: -73.9,
    latSpan: 0.1,
    lngSpan: 0.2,
};

const mockUserLoc = { lat: 40.7128, lng: -74.006 };

// Mock MapCanvas component
vi.mock('../../../components/Map/MapCanvas', () => {
    return {
        __esModule: true,
        default: ({ stations, selectedId, onSelect, userLoc }: any) => (
            <div data-testid="map-canvas">
                <div>Stations: {stations.length}</div>
                <div>Selected: {selectedId || 'none'}</div>
                <div>UserLoc: {userLoc ? `${userLoc.lat},${userLoc.lng}` : 'null'}</div>
                <button onClick={() => onSelect(stations[0]?.id)}>Select Station</button>
            </div>
        ),
    };
});

// Mock SelectedStationCard component
vi.mock('../SelectedStationCard', () => ({
    default: ({ station, onViewDetails, onOpenMaps }: any) => (
        <div data-testid="selected-station-card">
            <div>{station.name}</div>
            <button onClick={onViewDetails}>View Details</button>
            <button onClick={onOpenMaps}>Open Maps</button>
        </div>
    ),
}));

describe('MapPanel', () => {
    it('should render map canvas', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        const { container } = render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    });

    it('should render location button', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        const locationButton = screen.getByLabelText('Use my location');
        expect(locationButton).toBeInTheDocument();
    });

    it('should call onRequestLocation when location button is clicked', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        const locationButton = screen.getByLabelText('Use my location');
        fireEvent.click(locationButton);

        expect(onRequestLocation).toHaveBeenCalledTimes(1);
    });

    it('should disable location button when loading', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={true}
            />
        );

        const locationButton = screen.getByLabelText('Use my location');
        expect(locationButton).toBeDisabled();
    });

    it('should render selected station card when station is selected', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        const selectedStation: StationWithDistance = {
            ...mockStations[0],
        };

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId="station-1"
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={selectedStation}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        expect(screen.getByTestId('selected-station-card')).toBeInTheDocument();
        expect(screen.getByText('Test Station 1')).toBeInTheDocument();
    });

    it('should not render selected station card when no station is selected', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        expect(screen.queryByTestId('selected-station-card')).not.toBeInTheDocument();
    });

    it('should call onViewDetails with station id when View Details is clicked', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        const selectedStation: StationWithDistance = {
            ...mockStations[0],
        };

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId="station-1"
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={selectedStation}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(onViewDetails).toHaveBeenCalledWith('station-1');
    });

    it('should call onOpenMaps with station when Open Maps is clicked', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        const selectedStation: StationWithDistance = {
            ...mockStations[0],
        };

        render(
            <MapPanel
                stations={mockStations}
                bounds={mockBounds}
                selectedId="station-1"
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={selectedStation}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={true}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        const openMapsButton = screen.getByText('Open Maps');
        fireEvent.click(openMapsButton);

        expect(onOpenMaps).toHaveBeenCalledWith(selectedStation);
    });

    it('should handle empty stations array', () => {
        const onSelectStation = vi.fn();
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const onRequestLocation = vi.fn();

        const { container } = render(
            <MapPanel
                stations={[]}
                bounds={mockBounds}
                selectedId={null}
                onSelectStation={onSelectStation}
                userLoc={mockUserLoc}
                selectedStation={null}
                onViewDetails={onViewDetails}
                onOpenMaps={onOpenMaps}
                isMdUp={false}
                onRequestLocation={onRequestLocation}
                locationLoading={false}
            />
        );

        // Component should render without crashing even with empty stations
        expect(container.firstChild).toBeInTheDocument();
    });
});
