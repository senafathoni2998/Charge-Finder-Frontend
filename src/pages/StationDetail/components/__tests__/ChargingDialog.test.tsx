import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChargingDialog from '../ChargingDialog';
import type { Ticket } from '../../../types';

describe('ChargingDialog', () => {
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

    const mockProps = {
        open: true,
        onClose: vi.fn(),
        onStop: vi.fn(),
        chargingStatus: 'charging' as const,
        chargingCancelled: false,
        chargingProgress: 45,
        displayProgress: 45,
        ticket: mockTicket,
        ticketKwh: 50,
        deliveredKwh: 22.5,
        remainingMinutes: 15,
        estimatedRemainingMinutes: 12,
    };

    it('should render without crashing', () => {
        render(<ChargingDialog {...mockProps} />);
        expect(screen.getByText('Charging in progress')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<ChargingDialog {...mockProps} open={false} />);
        expect(screen.queryByText('Charging in progress')).not.toBeInTheDocument();
    });

    it('should render charging in progress title', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        expect(screen.getByText('Charging in progress')).toBeInTheDocument();
    });

    it('should render charging complete title', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" chargingCancelled={false} />);
        expect(screen.getByText('Charging complete')).toBeInTheDocument();
    });

    it('should render charging stopped title', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" chargingCancelled={true} />);
        expect(screen.getByText('Charging stopped')).toBeInTheDocument();
    });

    it('should render progress percentage', () => {
        render(<ChargingDialog {...mockProps} />);
        expect(screen.getByText('Battery 45%')).toBeInTheDocument();
    });

    it('should render delivered kWh when not charging', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" />);
        expect(screen.getByText('22.5 / 50 kWh')).toBeInTheDocument();
    });

    it('should render estimated time remaining', () => {
        render(<ChargingDialog {...mockProps} />);
        expect(screen.getByText(/Estimated time remaining:/)).toBeInTheDocument();
    });

    it('should render stop charging and hide buttons when charging', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        expect(screen.getByRole('button', { name: 'Stop charging' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    });

    it('should render done button when not charging', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" />);
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
        expect(screen.queryByText('Stop charging')).not.toBeInTheDocument();
    });

    it('should render ticket information', () => {
        render(<ChargingDialog {...mockProps} />);
        expect(screen.getByText('Ticket ID')).toBeInTheDocument();
        expect(screen.getByText('TICKET-123')).toBeInTheDocument();
        expect(screen.getByText('Paid with Visa •••• 4242')).toBeInTheDocument();
    });

    it('should not render ticket information when ticket is null', () => {
        render(<ChargingDialog {...mockProps} ticket={null} />);
        expect(screen.queryByText('Ticket ID')).not.toBeInTheDocument();
    });

    it('should open confirmation dialog when stop charging is clicked', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(screen.getByText('Stop charging?')).toBeInTheDocument();
    });

    it('should render keep charging button in confirmation dialog', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(screen.getByRole('button', { name: 'Keep charging' })).toBeInTheDocument();
    });

    it('should call onStop when stop charging is confirmed', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        fireEvent.click(screen.getByRole('button', { name: 'Stop charging' }));
        expect(mockProps.onStop).toHaveBeenCalled();
    });

    it('should call onClose when hide button is clicked', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when done button is clicked', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" />);
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should use chargingProgress when displayProgress is not finite', () => {
        render(<ChargingDialog {...mockProps} displayProgress={NaN} />);
        expect(screen.getByText('Battery 45%')).toBeInTheDocument();
    });

    it('should use displayProgress when it is finite', () => {
        render(<ChargingDialog {...mockProps} chargingProgress={30} displayProgress={60} />);
        expect(screen.getByText('Battery 60%')).toBeInTheDocument();
    });

    it('should use remainingMinutes when estimatedRemainingMinutes is not finite', () => {
        render(<ChargingDialog {...mockProps} estimatedRemainingMinutes={NaN} />);
        expect(screen.getByText(/min/)).toBeInTheDocument();
    });

    it('should use estimatedRemainingMinutes when it is finite', () => {
        render(<ChargingDialog {...mockProps} />);
        expect(screen.getByText(/min/)).toBeInTheDocument();
    });

    it('should handle negative estimated remaining minutes', () => {
        render(<ChargingDialog {...mockProps} estimatedRemainingMinutes={-5} />);
        // When estimatedRemainingMinutes is negative, it becomes 0, so "min" is not displayed
        expect(screen.getByText(/Estimated time remaining:/)).toBeInTheDocument();
    });

    it('should render correct description for charging state', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="charging" />);
        expect(screen.getByText('Keep the connector plugged in while we deliver your ticket.')).toBeInTheDocument();
    });

    it('should render correct description for complete state', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" chargingCancelled={false} />);
        expect(screen.getByText('Session complete. You can unplug when it is safe.')).toBeInTheDocument();
    });

    it('should render correct description for cancelled state', () => {
        render(<ChargingDialog {...mockProps} chargingStatus="done" chargingCancelled={true} />);
        expect(screen.getByText('Charging stopped. You can unplug when it is safe.')).toBeInTheDocument();
    });
});
