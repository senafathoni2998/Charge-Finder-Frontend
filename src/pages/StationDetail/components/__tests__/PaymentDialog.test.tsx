import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentDialog from '../PaymentDialog';
import type { PaymentMethod } from '../../../types';
import type { ChargingSpeed } from '../../../../models/model';

// Mock dependencies
vi.mock('../../../../utils/distance', () => ({
    formatCurrency: (currency: string, amount: number) => `£${amount.toFixed(2)}`,
}));

vi.mock('../InfoRow', () => ({
    default: ({ label, value }: any) => (
        <div><span>{label}:</span> <span>{value}</span></div>
    ),
}));

describe('PaymentDialog', () => {
    const mockPaymentMethods: PaymentMethod[] = [
        { id: 'pm1', label: 'Visa •••• 4242', helper: 'Expires 12/25' },
        { id: 'pm2', label: 'Mastercard •••• 8888', helper: 'Expires 06/26' },
    ];

    const mockProps = {
        open: true,
        onClose: vi.fn(),
        ticketKwh: 50,
        ticketKwhInput: '50',
        ticketKwhSuggested: 45,
        ticketKwhValid: true,
        onTicketKwhChange: vi.fn(),
        chargingSpeed: 'FAST' as ChargingSpeed,
        onChargingSpeedChange: vi.fn(),
        pricePerKwh: 0.35,
        currency: 'GBP',
        ticketPriceLabel: '£17.50',
        selectedPaymentId: 'pm1',
        onPaymentChange: vi.fn(),
        paymentMethods: mockPaymentMethods,
        onConfirm: vi.fn(),
        canSubmit: true,
        hasTicket: false,
        isSubmitting: false,
    };

    it('should render without crashing', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('Charging ticket')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<PaymentDialog {...mockProps} open={false} />);
        expect(screen.queryByText('Charging ticket')).not.toBeInTheDocument();
    });

    it('should render ticket size input', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByLabelText('Ticket size (kWh)')).toBeInTheDocument();
    });

    it('should render charging speed options', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getAllByText('Normal').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Fast').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Ultra fast').length).toBeGreaterThan(0);
    });

    it('should render payment methods', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('Visa •••• 4242')).toBeInTheDocument();
        expect(screen.getByText('Mastercard •••• 8888')).toBeInTheDocument();
    });

    it('should render ticket details', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('Ticket size:')).toBeInTheDocument();
        expect(screen.getByText('Speed:')).toBeInTheDocument();
        expect(screen.getByText('Per kWh:')).toBeInTheDocument();
        expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buy ticket' })).toBeInTheDocument();
    });

    it('should render update payment button when has ticket', () => {
        render(<PaymentDialog {...mockProps} hasTicket={true} />);
        expect(screen.getByRole('button', { name: 'Update payment' })).toBeInTheDocument();
    });

    it('should render processing button when isSubmitting', () => {
        render(<PaymentDialog {...mockProps} isSubmitting={true} />);
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
    });

    it('should disable confirm button when cannot submit', () => {
        render(<PaymentDialog {...mockProps} canSubmit={false} />);
        const button = screen.getByRole('button', { name: 'Buy ticket' });
        expect(button).toBeDisabled();
    });

    it('should disable confirm button when ticketKwh is invalid', () => {
        render(<PaymentDialog {...mockProps} ticketKwhValid={false} />);
        const button = screen.getByRole('button', { name: 'Buy ticket' });
        expect(button).toBeDisabled();
    });

    it('should call onTicketKwhChange when input changes', () => {
        render(<PaymentDialog {...mockProps} />);
        const input = screen.getByLabelText('Ticket size (kWh)');
        fireEvent.change(input, { target: { value: '60' } });
        expect(mockProps.onTicketKwhChange).toHaveBeenCalledWith('60');
    });

    it('should call onChargingSpeedChange when speed is changed', () => {
        render(<PaymentDialog {...mockProps} />);
        fireEvent.click(screen.getAllByText('Normal')[0]);
        expect(mockProps.onChargingSpeedChange).toHaveBeenCalledWith('NORMAL');
    });

    it('should call onPaymentChange when payment method is changed', () => {
        render(<PaymentDialog {...mockProps} />);
        fireEvent.click(screen.getAllByText('Mastercard •••• 8888')[0]);
        expect(mockProps.onPaymentChange).toHaveBeenCalledWith('pm2');
    });

    it('should call onClose when cancel button is clicked', () => {
        render(<PaymentDialog {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        render(<PaymentDialog {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Buy ticket' }));
        expect(mockProps.onConfirm).toHaveBeenCalled();
    });

    it('should show helper text when input is empty', () => {
        render(<PaymentDialog {...mockProps} ticketKwhInput="" />);
        expect(screen.getByText(/Suggested: 45 kWh/)).toBeInTheDocument();
    });

    it('should show error message when ticketKwh is invalid', () => {
        render(<PaymentDialog {...mockProps} ticketKwhValid={false} />);
        expect(screen.getByText('Enter a valid kWh amount.')).toBeInTheDocument();
    });

    it('should render submit error when present', () => {
        render(<PaymentDialog {...mockProps} submitError="Payment failed" />);
        expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });

    it('should render price breakdown', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('£0.35')).toBeInTheDocument();
        expect(screen.getByText('£17.50')).toBeInTheDocument();
    });

    it('should render dash when pricePerKwh is null', () => {
        render(<PaymentDialog {...mockProps} pricePerKwh={null} />);
        expect(screen.getByText('Per kWh:')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render dash when currency is null', () => {
        render(<PaymentDialog {...mockProps} currency={null} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render helper text for charging speeds', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('Standard charging speed.')).toBeInTheDocument();
        expect(screen.getByText('Higher power delivery.')).toBeInTheDocument();
        expect(screen.getByText('Highest power option.')).toBeInTheDocument();
    });

    it('should render helper text for payment methods', () => {
        render(<PaymentDialog {...mockProps} />);
        expect(screen.getByText('Expires 12/25')).toBeInTheDocument();
        expect(screen.getByText('Expires 06/26')).toBeInTheDocument();
    });
});
