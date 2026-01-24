import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationListItem from '../StationListItem';
import type { Station } from '../../../../models/model';
import { minutesAgo } from '../../../../utils/time';

vi.mock('../../../../utils/time', () => ({
    minutesAgo: vi.fn(() => 5),
}));

describe('StationListItem', () => {
    const mockStation: Station = {
        id: 's1',
        name: 'Test Station',
        address: '123 Test Street, Test City',
        status: 'AVAILABLE',
        lastUpdatedISO: '2025-01-24T10:00:00Z',
        connectors: [
            { type: 'Type2', powerKW: 22, ports: 2, availablePorts: 2 },
            { type: 'CCS2', powerKW: 50, ports: 1, availablePorts: 0 },
        ],
        coordinates: { lat: 50, lng: 10 },
    };

    it('should render station details', () => {
        render(<StationListItem station={mockStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('Test Station')).toBeInTheDocument();
        expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument();
    });

    it('should render port summary chip', () => {
        render(<StationListItem station={mockStation} onOpenMenu={vi.fn()} />);

        // The text is split by span elements, so use a flexible matcher
        expect(screen.getByText((content) => content.includes('3') && content.includes('ports'))).toBeInTheDocument();
    });

    it('should render connector types', () => {
        render(<StationListItem station={mockStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('Type2, CCS2')).toBeInTheDocument();
    });

    it('should render last updated time', () => {
        render(<StationListItem station={mockStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText(/Updated .*m ago/)).toBeInTheDocument();
    });

    it('should render status chip with correct style', () => {
        render(<StationListItem station={mockStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
    });

    it('should render status chip for OFFLINE status', () => {
        const offlineStation = { ...mockStation, status: 'OFFLINE' as const };
        render(<StationListItem station={offlineStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });

    it('should render status chip for BUSY status', () => {
        const busyStation = { ...mockStation, status: 'BUSY' as const };
        render(<StationListItem station={busyStation} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('BUSY')).toBeInTheDocument();
    });

    it('should call onOpenMenu when menu button is clicked', () => {
        const onOpenMenu = vi.fn();
        render(<StationListItem station={mockStation} onOpenMenu={onOpenMenu} />);

        const menuButton = screen.getByLabelText('Station actions');
        fireEvent.click(menuButton);

        expect(onOpenMenu).toHaveBeenCalledTimes(1);
        expect(onOpenMenu).toHaveBeenCalledWith(expect.anything(), mockStation);
    });

    it('should calculate correct available ports', () => {
        const stationWithPartialPorts: Station = {
            ...mockStation,
            connectors: [
                { type: 'Type2', powerKW: 22, ports: 4, availablePorts: 2 },
            ],
        };

        render(<StationListItem station={stationWithPartialPorts} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('2/4 ports')).toBeInTheDocument();
    });
});
