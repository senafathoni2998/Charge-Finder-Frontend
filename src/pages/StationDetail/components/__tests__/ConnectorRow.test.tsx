import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConnectorRow from '../ConnectorRow';
import type { Connector } from '../../../models/model';

describe('ConnectorRow', () => {
    const mockConnector: Connector = {
        type: 'CCS2',
        powerKW: 50,
        ports: 4,
        availablePorts: 2,
    };

    it('should render without crashing', () => {
        render(<ConnectorRow c={mockConnector} />);
        expect(screen.getByText('CCS2')).toBeInTheDocument();
    });

    it('should render the connector type', () => {
        render(<ConnectorRow c={mockConnector} />);
        expect(screen.getByText('CCS2')).toBeInTheDocument();
    });

    it('should render the power kW chip', () => {
        render(<ConnectorRow c={mockConnector} />);
        expect(screen.getByText('50 kW')).toBeInTheDocument();
    });

    it('should render the availability text', () => {
        render(<ConnectorRow c={mockConnector} />);
        expect(screen.getByText('2/4 available')).toBeInTheDocument();
    });

    it('should render with all ports available', () => {
        const connector: Connector = {
            type: 'Type2',
            powerKW: 22,
            ports: 2,
            availablePorts: 2,
        };
        render(<ConnectorRow c={connector} />);
        expect(screen.getByText('2/2 available')).toBeInTheDocument();
        expect(screen.getByText('Type2')).toBeInTheDocument();
        expect(screen.getByText('22 kW')).toBeInTheDocument();
    });

    it('should render with no ports available', () => {
        const connector: Connector = {
            type: 'CHAdeMO',
            powerKW: 50,
            ports: 2,
            availablePorts: 0,
        };
        render(<ConnectorRow c={connector} />);
        expect(screen.getByText('0/2 available')).toBeInTheDocument();
    });

    it('should render within a bordered box', () => {
        const { container } = render(<ConnectorRow c={mockConnector} />);
        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
        const styles = getComputedStyle(box);
        expect(parseFloat(styles.borderTopWidth)).toBeGreaterThan(0);
        expect(styles.borderTopStyle).toBe('solid');
        expect(parseFloat(styles.paddingTop)).toBeGreaterThan(0);
    });
});
