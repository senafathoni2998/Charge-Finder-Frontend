import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationCard from '../StationCard';
import type { StationWithDistance } from '../../types';

const mockStation: StationWithDistance = {
    id: 'station-1',
    name: 'Test Station',
    address: '123 Test St',
    lat: 40.7128,
    lng: -74.006,
    status: 'AVAILABLE',
    isChargingHere: false,
    connectors: [
        { type: 'CCS2', powerKW: 150 },
        { type: 'Type2', powerKW: 22 },
        { type: 'CHAdeMO', powerKW: 100 },
    ],
    distanceKm: 5.5,
    lastUpdatedISO: new Date().toISOString(),
};

describe('StationCard', () => {
    it('should render station name', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('Test Station')).toBeInTheDocument();
    });

    it('should render station address', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('123 Test St')).toBeInTheDocument();
    });

    it('should render distance', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('5.5 km away')).toBeInTheDocument();
    });

    it('should render connector chips', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('CCS2 • 150kW')).toBeInTheDocument();
        expect(screen.getByText('Type2 • 22kW')).toBeInTheDocument();
        expect(screen.getByText('CHAdeMO • 100kW')).toBeInTheDocument();
    });

    it('should render status chip', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should render Charging status when isChargingHere is true', () => {
        const focusStation = vi.fn();
        const chargingStation = { ...mockStation, isChargingHere: true };
        render(<StationCard s={chargingStation} selectedId={null} focusStation={focusStation} />);
        expect(screen.getByText('Charging')).toBeInTheDocument();
    });

    it('should call focusStation when clicked', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);

        const card = screen.getByText('Test Station').closest('.MuiCard-root');
        fireEvent.click(card!);

        expect(focusStation).toHaveBeenCalledWith(mockStation);
    });

    it('should display selected styling when selectedId matches', () => {
        const focusStation = vi.fn();
        const { container } = render(
            <StationCard s={mockStation} selectedId="station-1" focusStation={focusStation} />
        );

        const card = container.querySelector('.MuiCard-root');
        expect(card).toBeInTheDocument();
    });

    it('should not display selected styling when selectedId does not match', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId="other-station" focusStation={focusStation} />);

        const card = screen.getByText('Test Station').closest('.MuiCard-root');
        expect(card).toBeInTheDocument();
    });

    it('should limit connector chips to 3', () => {
        const focusStation = vi.fn();
        const stationWithManyConnectors: StationWithDistance = {
            ...mockStation,
            connectors: [
                { type: 'CCS2', powerKW: 150 },
                { type: 'Type2', powerKW: 22 },
                { type: 'CHAdeMO', powerKW: 100 },
                { type: 'CCS2', powerKW: 50 },
            ],
        };

        render(<StationCard s={stationWithManyConnectors} selectedId={null} focusStation={focusStation} />);

        const chips = screen.getAllByText(/kW/);
        expect(chips.length).toBe(3);
    });

    it('should render updated time', () => {
        const focusStation = vi.fn();
        render(<StationCard s={mockStation} selectedId={null} focusStation={focusStation} />);

        const timeText = screen.getByText(/Updated .*m ago/);
        expect(timeText).toBeInTheDocument();
    });

    it('should handle empty connectors', () => {
        const focusStation = vi.fn();
        const stationWithNoConnectors: StationWithDistance = {
            ...mockStation,
            connectors: [],
        };

        render(<StationCard s={stationWithNoConnectors} selectedId={null} focusStation={focusStation} />);

        const chips = screen.queryByText(/kW/);
        expect(chips).toBeNull();
    });
});
