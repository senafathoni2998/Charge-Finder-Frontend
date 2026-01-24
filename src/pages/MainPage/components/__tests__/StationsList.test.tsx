import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StationsList from '../StationsList';
import type { StationWithDistance } from '../../types';

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
    {
        id: 'station-2',
        name: 'Test Station 2',
        address: '456 Test Ave',
        lat: 40.7228,
        lng: -74.016,
        status: 'BUSY',
        isChargingHere: false,
        connectors: [{ type: 'Type2', powerKW: 22 }],
        distanceKm: 3.2,
        lastUpdatedISO: new Date().toISOString(),
    },
];

// Mock StationCard component
vi.mock('../StationCard', () => ({
    default: ({ s, selectedId, focusStation }: any) => (
        <div data-testid={`station-card-${s.id}`}>
            <div>{s.name}</div>
            <div>{s.address}</div>
            <div>Selected: {selectedId === s.id ? 'yes' : 'no'}</div>
            <button onClick={() => focusStation(s)}>Focus</button>
        </div>
    ),
}));

describe('StationsList', () => {
    it('should render the Stations header', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={mockStations} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('Stations')).toBeInTheDocument();
    });

    it('should render station count badge', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={mockStations} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render all stations', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={mockStations} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByTestId('station-card-station-1')).toBeInTheDocument();
        expect(screen.getByTestId('station-card-station-2')).toBeInTheDocument();
    });

    it('should render empty state when no stations', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={[]} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('No stations match your filters.')).toBeInTheDocument();
    });

    it('should display suggestion text when no stations', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={[]} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(
            screen.getByText('Try increasing distance, clearing connector, or lowering the minimum kW.')
        ).toBeInTheDocument();
    });

    it('should show correct count for single station', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={[mockStations[0]]} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show zero count when no stations', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={[]} selectedId={null} onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should pass selectedId to station cards', () => {
        const onFocusStation = vi.fn();
        render(
            <StationsList stations={mockStations} selectedId="station-1" onFocusStation={onFocusStation} />
        );

        expect(screen.getByText('Selected: yes')).toBeInTheDocument();
        expect(screen.getByText('Selected: no')).toBeInTheDocument();
    });

    it('should pass onFocusStation to station cards', () => {
        const onFocusStation = vi.fn();
        const { getAllByText } = render(
            <StationsList stations={mockStations} selectedId={null} onFocusStation={onFocusStation} />
        );

        const focusButtons = getAllByText('Focus');
        expect(focusButtons.length).toBe(2);
    });
});
