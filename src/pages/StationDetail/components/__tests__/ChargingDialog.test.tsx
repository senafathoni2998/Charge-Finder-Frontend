import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChargingDialog from '../ChargingDialog';
import type { Ticket } from '../../../types';

// Helper function to create default props
function createMockProps(overrides = {}) {
    const mockTicket: Ticket = {
        id: 'TICKET-123',
        methodId: 'pm1',
        methodLabel: 'Visa •••• 4242',
        priceLabel: '£10.50',
        purchasedAt: '2024-01-01T00:00:00Z',
        chargingStatus: 'charging',
        progressPercent: 45,
        chargingStartedAt: '2024-01-01T00:00:00Z',
        chargingUpdatedAt: '2024-01-01T00:05:00Z',
    };

    const defaultProps = {
        dialogState: {
            open: true,
            onClose: vi.fn(),
            onStop: vi.fn(),
        },
        chargingProgress: {
            status: 'charging' as const,
            cancelled: false,
            progress: 45,
            displayProgress: 45,
            ticket: mockTicket,
            ticketKwh: 50,
            deliveredKwh: 22.5,
            remainingMinutes: 15,
            estimatedRemainingMinutes: 12,
        },
    };

    return { ...defaultProps, ...overrides };
}

describe('ChargingDialog', () => {
    it('should render without crashing', () => {
        const props = createMockProps();
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Charging in progress')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        const props = createMockProps({
            dialogState: { ...createMockProps().dialogState, open: false },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.queryByText('Charging in progress')).not.toBeInTheDocument();
    });

    it('should render charging in progress title', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Charging in progress')).toBeInTheDocument();
    });

    it('should render charging complete title', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const, cancelled: false },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Charging complete')).toBeInTheDocument();
    });

    it('should render charging stopped title', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const, cancelled: true },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Charging stopped')).toBeInTheDocument();
    });

    it('should render progress percentage', () => {
        const props = createMockProps();
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Battery 45%')).toBeInTheDocument();
    });

    it('should not render delivered kWh when charging is complete', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.queryByText('22.5 / 50 kWh')).not.toBeInTheDocument();
    });

    it('should render estimated time remaining', () => {
        const props = createMockProps();
        render(<ChargingDialog {...props} />);
        expect(screen.getByText(/Estimated time remaining:/)).toBeInTheDocument();
    });

    it('should render stop charging and hide buttons when charging', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByRole('button', { name: 'Stop charging' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    it('should render done button when not charging', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
        expect(screen.queryByText('Stop charging')).not.toBeInTheDocument();
    });

    it('should render ticket information', () => {
        const props = createMockProps();
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Ticket ID')).toBeInTheDocument();
        expect(screen.getByText('TICKET-123')).toBeInTheDocument();
        expect(screen.getByText('Paid with Visa •••• 4242')).toBeInTheDocument();
    });

    it('should not render ticket information when ticket is null', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, ticket: null },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.queryByText('Ticket ID')).not.toBeInTheDocument();
    });

    it('should open confirmation dialog when stop charging is clicked', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(screen.getByText('Stop charging?')).toBeInTheDocument();
    });

    it('should render keep charging button in confirmation dialog', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(screen.getByRole('button', { name: 'Keep charging' })).toBeInTheDocument();
    });

    it('should call onStop when stop charging is confirmed', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(props.dialogState.onStop).toHaveBeenCalled();
    });

    it('should call onClose when hide button is clicked', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
        expect(props.dialogState.onClose).toHaveBeenCalled();
    });

    it('should call onClose when done button is clicked', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const },
        });
        render(<ChargingDialog {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(props.dialogState.onClose).toHaveBeenCalled();
    });

    it('should use chargingProgress when displayProgress is not finite', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, displayProgress: NaN },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Battery 45%')).toBeInTheDocument();
    });

    it('should use displayProgress when it is finite', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, progress: 30, displayProgress: 60 },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Battery 60%')).toBeInTheDocument();
    });

    it('should use remainingMinutes when estimatedRemainingMinutes is not finite', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, estimatedRemainingMinutes: NaN },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText(/min/)).toBeInTheDocument();
    });

    it('should use estimatedRemainingMinutes when it is finite', () => {
        const props = createMockProps();
        render(<ChargingDialog {...props} />);
        expect(screen.getByText(/min/)).toBeInTheDocument();
    });

    it('should handle negative estimated remaining minutes', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, estimatedRemainingMinutes: -5 },
        });
        // When estimatedRemainingMinutes is negative, it becomes 0
        // The component handles this gracefully without crashing
        render(<ChargingDialog {...props} />);
        // Should not show "min" label since remainingMinutes (0) is not > 0
        expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });

    it('should render correct description for charging state', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'charging' as const },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Keep the connector plugged in while we deliver your ticket.')).toBeInTheDocument();
    });

    it('should render correct description for complete state', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const, cancelled: false },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Session complete. You can unplug when it is safe.')).toBeInTheDocument();
    });

    it('should render correct description for cancelled state', () => {
        const props = createMockProps({
            chargingProgress: { ...createMockProps().chargingProgress, status: 'done' as const, cancelled: true },
        });
        render(<ChargingDialog {...props} />);
        expect(screen.getByText('Charging stopped. You can unplug when it is safe.')).toBeInTheDocument();
    });
});
