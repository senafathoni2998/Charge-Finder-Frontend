import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionsCard from '../ActionsCard';
import type { Station } from '../../../types';
import type { UserCar } from '../../../../features/auth/authSlice';
import type { Availability } from '../../../../models/model';

// Mock dependencies
vi.mock('../../../../utils/time', () => ({
    minutesAgo: (isoString: string) => 10,
}));

vi.mock('../../../../utils/map', () => ({
    statusColor: (status: Availability, isChargingHere?: boolean) => 'green',
}));

vi.mock('../../../../utils/distance', () => ({
    statusLabel: (status: Availability) => 'Available',
}));

describe('ActionsCard', () => {
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
        amenities: [],
    };

    const mockActiveCar: UserCar = {
        id: 'car1',
        name: 'Tesla Model 3',
        connectorTypes: ['CCS2'],
        batteryCapacity: 75,
    };

    const mockProps = {
        loading: false,
        station: mockStation,
        isAuthenticated: true,
        hasTicket: true,
        activeCar: mockActiveCar,
        isCompatible: true,
        canCharge: true,
        chargingActionLabel: 'Start charging',
        onChargingAction: vi.fn(),
        onOpenMaps: vi.fn(),
    };

    it('should render without crashing', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render charging action button', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Start charging' })).toBeInTheDocument();
    });

    it('should render open in maps button', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Open in Google Maps' })).toBeInTheDocument();
    });

    it('should render charging status section', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.getByText('Charging status')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should render updated time', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.getByText('10m')).toBeInTheDocument();
    });

    it('should call onChargingAction when charging button is clicked', () => {
        render(<ActionsCard {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Start charging' }));
        expect(mockProps.onChargingAction).toHaveBeenCalled();
    });

    it('should call onOpenMaps when maps button is clicked', () => {
        render(<ActionsCard {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Open in Google Maps' }));
        expect(mockProps.onOpenMaps).toHaveBeenCalled();
    });

    it('should disable charging button when canCharge is false', () => {
        render(<ActionsCard {...mockProps} canCharge={false} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeDisabled();
    });

    it('should disable charging button when chargingLoading is true', () => {
        render(<ActionsCard {...mockProps} chargingLoading={true} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeDisabled();
    });

    it('shows a checking-status label + disabled button while statusLoading', () => {
        render(
            <ActionsCard {...mockProps} statusLoading={true} canCharge={true} />
        );
        const button = screen.getByRole('button', { name: /Checking status/ });
        expect(button).toBeDisabled();
        // The (possibly wrong) default label is not shown yet.
        expect(
            screen.queryByRole('button', { name: 'Start charging' })
        ).not.toBeInTheDocument();
    });

    it('suppresses the buy-to-start hint while statusLoading', () => {
        render(
            <ActionsCard
                {...mockProps}
                statusLoading={true}
                isAuthenticated={true}
                hasTicket={false}
            />
        );
        expect(
            screen.queryByText(/Buy a ticket to start charging/)
        ).not.toBeInTheDocument();
    });

    it('should render login message when not authenticated', () => {
        render(<ActionsCard {...mockProps} isAuthenticated={false} />);
        expect(screen.getByText(/Log in to buy a ticket/)).toBeInTheDocument();
    });

    it('should render buy ticket message when authenticated but no ticket', () => {
        render(<ActionsCard {...mockProps} isAuthenticated={true} hasTicket={false} />);
        expect(screen.getByText(/Buy a ticket to start charging/)).toBeInTheDocument();
    });

    it('should not render ticket messages when has ticket', () => {
        render(<ActionsCard {...mockProps} hasTicket={true} />);
        expect(screen.queryByText('Log in to buy a ticket and start charging.')).not.toBeInTheDocument();
        expect(screen.queryByText('Buy a ticket to start charging.')).not.toBeInTheDocument();
    });

    it('should render not compatible message when car is not compatible', () => {
        render(<ActionsCard {...mockProps} isCompatible={false} />);
        expect(screen.getByText(/Not compatible with your car/)).toBeInTheDocument();
    });

    it('should render charging error when present', () => {
        render(<ActionsCard {...mockProps} chargingError='Connection failed' />);
        expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should render skeleton when loading', () => {
        render(<ActionsCard {...mockProps} loading={true} />);
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render status message for BUSY station', () => {
        const busyStation: Station = {
            ...mockStation,
            status: 'BUSY',
        };
        render(<ActionsCard {...mockProps} station={busyStation} />);
        expect(screen.getByText(/All ports are currently in use/)).toBeInTheDocument();
    });

    it('should render status message for OFFLINE station', () => {
        const offlineStation: Station = {
            ...mockStation,
            status: 'OFFLINE',
        };
        render(<ActionsCard {...mockProps} station={offlineStation} />);
        expect(screen.getByText(/This station is currently offline/)).toBeInTheDocument();
    });

    it('should not render additional status message for AVAILABLE station', () => {
        render(<ActionsCard {...mockProps} />);
        expect(screen.queryByText(/All ports are currently in use/)).not.toBeInTheDocument();
        expect(screen.queryByText(/This station is currently offline/)).not.toBeInTheDocument();
    });

    it('should not render compatibility message when no active car', () => {
        render(<ActionsCard {...mockProps} activeCar={null} />);
        expect(screen.queryByText("Not compatible with your car's connector types.")).not.toBeInTheDocument();
    });
});
