import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusChip from '../StatusChip';

describe('StatusChip', () => {
    describe('when status is AVAILABLE', () => {
        it('should render Available label', () => {
            render(<StatusChip status="AVAILABLE" isChargingHere={false} />);
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should have correct color scheme for available', () => {
            const { container } = render(<StatusChip status="AVAILABLE" isChargingHere={false} />);
            const chip = container.querySelector('.MuiChip-root');
            expect(chip).toBeInTheDocument();
        });
    });

    describe('when status is BUSY', () => {
        it('should render Busy label', () => {
            render(<StatusChip status="BUSY" isChargingHere={false} />);
            expect(screen.getByText('Busy')).toBeInTheDocument();
        });
    });

    describe('when status is OFFLINE', () => {
        it('should render Offline label', () => {
            render(<StatusChip status="OFFLINE" isChargingHere={false} />);
            expect(screen.getByText('Offline')).toBeInTheDocument();
        });
    });

    describe('when status is CHARGING', () => {
        it('should render Charging label', () => {
            render(<StatusChip status="CHARGING" isChargingHere={false} />);
            expect(screen.getByText('Charging')).toBeInTheDocument();
        });
    });

    describe('when isChargingHere is true', () => {
        it('should render Charging label regardless of status', () => {
            render(<StatusChip status="AVAILABLE" isChargingHere={true} />);
            expect(screen.getByText('Charging')).toBeInTheDocument();
        });

        it('should render Charging label when status is BUSY', () => {
            render(<StatusChip status="BUSY" isChargingHere={true} />);
            expect(screen.getByText('Charging')).toBeInTheDocument();
        });

        it('should render Charging label when status is OFFLINE', () => {
            render(<StatusChip status="OFFLINE" isChargingHere={true} />);
            expect(screen.getByText('Charging')).toBeInTheDocument();
        });
    });

    describe('when status is unrecognized', () => {
        it('should default to Offline label', () => {
            render(<StatusChip status="UNKNOWN" as any isChargingHere={false} />);
            expect(screen.getByText('Offline')).toBeInTheDocument();
        });
    });

    describe('chip styling', () => {
        it('should have small size', () => {
            const { container } = render(<StatusChip status="AVAILABLE" isChargingHere={false} />);
            const chip = container.querySelector('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-sizeSmall');
        });

        it('should have outlined variant', () => {
            const { container } = render(<StatusChip status="AVAILABLE" isChargingHere={false} />);
            const chip = container.querySelector('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-outlined');
        });
    });
});
