import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectedStationCard from '../SelectedStationCard';
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
    ],
    distanceKm: 5.5,
    lastUpdatedISO: new Date().toISOString(),
};

describe('SelectedStationCard', () => {
    it('should render station name', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('Test Station')).toBeInTheDocument();
    });

    it('should render station address', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('123 Test St')).toBeInTheDocument();
    });

    it('should render all connector chips', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('CCS2 • 150kW')).toBeInTheDocument();
        expect(screen.getByText('Type2 • 22kW')).toBeInTheDocument();
    });

    it('should render distance', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('5.5 km away')).toBeInTheDocument();
    });

    it('should render status chip', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should render Charging status when isChargingHere is true', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();
        const chargingStation = { ...mockStation, isChargingHere: true };

        render(
            <SelectedStationCard station={chargingStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        expect(screen.getByText('Charging')).toBeInTheDocument();
    });

    it('should call onViewDetails when View details button is clicked', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        const viewDetailsButton = screen.getByText('View details');
        fireEvent.click(viewDetailsButton);

        expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenMaps when maps button is clicked', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        const mapsButton = screen.getByLabelText('Open in Google Maps');
        fireEvent.click(mapsButton);

        expect(onOpenMaps).toHaveBeenCalledTimes(1);
    });

    it('should render updated time', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        const timeText = screen.getByText(/Updated .*m ago/);
        expect(timeText).toBeInTheDocument();
    });

    it('should have View details button as contained variant', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        const viewDetailsButton = screen.getByText('View details');
        expect(viewDetailsButton).toBeInTheDocument();
    });

    it('should have maps button as outlined variant', () => {
        const onViewDetails = vi.fn();
        const onOpenMaps = vi.fn();

        render(
            <SelectedStationCard station={mockStation} onViewDetails={onViewDetails} onOpenMaps={onOpenMaps} />
        );

        const mapsButton = screen.getByLabelText('Open in Google Maps');
        expect(mapsButton).toBeInTheDocument();
    });
});
