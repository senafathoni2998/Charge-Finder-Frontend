import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PricingSection from '../PricingSection';
import type { Station } from '../../../types';

// Mock dependencies
vi.mock('../../../../utils/distance', () => ({
    formatCurrency: (currency: string, amount: number) => `£${amount.toFixed(2)}`,
}));

vi.mock('../InfoRow', () => ({
    default: ({ label, value }: any) => (
        <div><span>{label}:</span> <span>{value}</span></div>
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

describe('PricingSection', () => {
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
            perMinute: 0.10,
            parkingFee: '£2.00/hour',
        },
        amenities: [],
    };

    const mockProps = {
        loading: false,
        station: mockStation,
        paymentActionLabel: 'Buy ticket',
        paymentDisabled: false,
        onPaymentOpen: vi.fn(),
    };

    it('should render without crashing', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should render title and subtitle', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByText('Pricing')).toBeInTheDocument();
        expect(screen.getByText('Estimated cost info (may vary by operator)')).toBeInTheDocument();
    });

    it('should render payment action button', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Buy ticket' })).toBeInTheDocument();
    });

    it('should call onPaymentOpen when button is clicked', () => {
        render(<PricingSection {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Buy ticket' }));
        expect(mockProps.onPaymentOpen).toHaveBeenCalled();
    });

    it('should disable payment button when paymentDisabled is true', () => {
        render(<PricingSection {...mockProps} paymentDisabled={true} />);
        const button = screen.getByRole('button', { name: 'Buy ticket' });
        expect(button).toBeDisabled();
    });

    it('should render per kWh pricing', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByText('Per kWh:')).toBeInTheDocument();
        expect(screen.getByText('£0.35')).toBeInTheDocument();
    });

    it('should render per minute pricing', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByText('Per minute:')).toBeInTheDocument();
        expect(screen.getByText('£0.10')).toBeInTheDocument();
    });

    it('should render parking fee', () => {
        render(<PricingSection {...mockProps} />);
        expect(screen.getByText('Parking:')).toBeInTheDocument();
        expect(screen.getByText('£2.00/hour')).toBeInTheDocument();
    });

    it('should render dash when perKwh is not available', () => {
        const stationWithoutPricing: Station = {
            ...mockStation,
            pricing: {
                ...mockStation.pricing,
                perKwh: 0,
            },
        };
        render(<PricingSection {...mockProps} station={stationWithoutPricing} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render dash when perMinute is not available', () => {
        const stationWithoutPerMinute: Station = {
            ...mockStation,
            pricing: {
                currency: 'GBP',
                perKwh: 0.35,
            },
        };
        render(<PricingSection {...mockProps} station={stationWithoutPerMinute} />);
        expect(screen.getByText('Per minute:')).toBeInTheDocument();
        expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('should render dash when parkingFee is not available', () => {
        const stationWithoutParkingFee: Station = {
            ...mockStation,
            pricing: {
                ...mockStation.pricing,
                parkingFee: undefined,
            },
        };
        render(<PricingSection {...mockProps} station={stationWithoutParkingFee} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render skeletons when loading', () => {
        render(<PricingSection {...mockProps} loading={true} />);
        expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should render skeletons when station is null', () => {
        render(<PricingSection {...mockProps} station={null} />);
        expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should render custom action label', () => {
        render(<PricingSection {...mockProps} paymentActionLabel="Purchase ticket" />);
        expect(screen.getByRole('button', { name: 'Purchase ticket' })).toBeInTheDocument();
    });

    it('should not render pricing info when station is null', () => {
        render(<PricingSection {...mockProps} station={null} />);
        expect(screen.queryByText('Per kWh:')).not.toBeInTheDocument();
    });
});
