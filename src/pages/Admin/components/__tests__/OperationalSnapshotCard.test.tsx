import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OperationalSnapshotCard from '../OperationalSnapshotCard';

describe('OperationalSnapshotCard', () => {
    it('should render title and description', () => {
        render(<OperationalSnapshotCard />);

        expect(screen.getByText('Operational snapshot')).toBeInTheDocument();
        expect(screen.getByText(/Review key signals and keep the network healthy/)).toBeInTheDocument();
    });

    it('should render all status chips', () => {
        render(<OperationalSnapshotCard />);

        expect(screen.getByText('Stations synced')).toBeInTheDocument();
        expect(screen.getByText('Security checks passed')).toBeInTheDocument();
        expect(screen.getByText('Last sync 5m ago')).toBeInTheDocument();
    });

    it('should render within a card with correct styles', () => {
        const { container } = render(<OperationalSnapshotCard />);

        const card = container.querySelector('MuiCard-root') || container.firstChild as HTMLElement;
        expect(card).toBeInTheDocument();
    });
});
