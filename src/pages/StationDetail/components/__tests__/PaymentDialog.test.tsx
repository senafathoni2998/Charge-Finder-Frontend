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

// Helper function to create default props
function createMockProps(overrides = {}) {
    const mockPaymentMethods: PaymentMethod[] = [
        { id: 'pm1', label: 'Visa •••• 4242', helper: 'Expires 12/25' },
        { id: 'pm2', label: 'Mastercard •••• 8888', helper: 'Expires 06/26' },
    ];

    const defaultProps = {
        dialogState: {
            open: true,
            onClose: vi.fn(),
            onConfirm: vi.fn(),
            canSubmit: true,
            hasTicket: false,
            submitError: null as string | null,
            isSubmitting: false,
        },
        ticketConfig: {
            ticketKwh: 50,
            ticketKwhInput: '50',
            ticketKwhSuggested: 45,
            ticketKwhValid: true,
            onTicketKwhChange: vi.fn(),
            chargingSpeed: 'FAST' as ChargingSpeed,
            onChargingSpeedChange: vi.fn(),
        },
        pricing: {
            pricePerKwh: 0.35,
            currency: 'GBP',
            ticketPriceLabel: '£17.50',
        },
        paymentSelection: {
            selectedPaymentId: 'pm1',
            onPaymentChange: vi.fn(),
            paymentMethods: mockPaymentMethods,
        },
    };

    return { ...defaultProps, ...overrides };
}

describe('PaymentDialog', () => {
    it('should render without crashing', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Charging ticket')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, open: false },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.queryByText('Charging ticket')).not.toBeInTheDocument();
    });

    it('should render ticket size input', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByLabelText('Ticket size (kWh)')).toBeInTheDocument();
    });

    it('should render charging speed options', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getAllByText('Normal').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Fast').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Ultra fast').length).toBeGreaterThan(0);
    });

    it('should render payment methods', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Visa •••• 4242')).toBeInTheDocument();
        expect(screen.getByText('Mastercard •••• 8888')).toBeInTheDocument();
    });

    it('should render ticket details', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Ticket size:')).toBeInTheDocument();
        expect(screen.getByText('Speed:')).toBeInTheDocument();
        expect(screen.getByText('Per kWh:')).toBeInTheDocument();
        expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buy ticket' })).toBeInTheDocument();
    });

    it('should render update payment button when has ticket', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, hasTicket: true },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByRole('button', { name: 'Update payment' })).toBeInTheDocument();
    });

    it('should render processing button when isSubmitting', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, isSubmitting: true },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
    });

    it('should disable confirm button when cannot submit', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, canSubmit: false },
        });
        render(<PaymentDialog {...props} />);
        const button = screen.getByRole('button', { name: 'Buy ticket' });
        expect(button).toBeDisabled();
    });

    it('should disable confirm button when ticketKwh is invalid', () => {
        const props = createMockProps({
            ticketConfig: { ...createMockProps().ticketConfig, ticketKwhValid: false },
        });
        render(<PaymentDialog {...props} />);
        const button = screen.getByRole('button', { name: 'Buy ticket' });
        expect(button).toBeDisabled();
    });

    it('should call onTicketKwhChange when input changes', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        const input = screen.getByLabelText('Ticket size (kWh)');
        fireEvent.change(input, { target: { value: '60' } });
        expect(props.ticketConfig.onTicketKwhChange).toHaveBeenCalledWith('60');
    });

    it('should call onChargingSpeedChange when speed is changed', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        fireEvent.click(screen.getAllByText('Normal')[0]);
        expect(props.ticketConfig.onChargingSpeedChange).toHaveBeenCalledWith('NORMAL');
    });

    it('should call onPaymentChange when payment method is changed', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        fireEvent.click(screen.getAllByText('Mastercard •••• 8888')[0]);
        expect(props.paymentSelection.onPaymentChange).toHaveBeenCalledWith('pm2');
    });

    it('should call onClose when cancel button is clicked', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(props.dialogState.onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Buy ticket' }));
        expect(props.dialogState.onConfirm).toHaveBeenCalled();
    });

    it('should show helper text when input is empty', () => {
        const props = createMockProps({
            ticketConfig: { ...createMockProps().ticketConfig, ticketKwhInput: '' },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByText(/Suggested: 45 kWh/)).toBeInTheDocument();
    });

    it('should show error message when ticketKwh is invalid', () => {
        const props = createMockProps({
            ticketConfig: { ...createMockProps().ticketConfig, ticketKwhValid: false },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Enter a valid kWh amount.')).toBeInTheDocument();
    });

    it('should render submit error when present', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, submitError: 'Payment failed' },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });

    it('should render price breakdown', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('£0.35')).toBeInTheDocument();
        expect(screen.getByText('£17.50')).toBeInTheDocument();
    });

    it('should render dash when pricePerKwh is null', () => {
        const props = createMockProps({
            pricing: { ...createMockProps().pricing, pricePerKwh: null },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Per kWh:')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render dash when currency is null', () => {
        const props = createMockProps({
            pricing: { ...createMockProps().pricing, currency: null },
        });
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render helper text for charging speeds', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Standard charging speed.')).toBeInTheDocument();
        expect(screen.getByText('Higher power delivery.')).toBeInTheDocument();
        expect(screen.getByText('Highest power option.')).toBeInTheDocument();
    });

    it('should render helper text for payment methods', () => {
        const props = createMockProps();
        render(<PaymentDialog {...props} />);
        expect(screen.getByText('Expires 12/25')).toBeInTheDocument();
        expect(screen.getByText('Expires 06/26')).toBeInTheDocument();
    });
});
