import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConnectorChip from '../ConnectorChip';

describe('ConnectorChip', () => {
    it('should render the connector type and power', () => {
        render(<ConnectorChip type="CCS2" powerKW={150} />);
        expect(screen.getByText('CCS2 • 150kW')).toBeInTheDocument();
    });

    it('should render CCS2 connector', () => {
        render(<ConnectorChip type="CCS2" powerKW={50} />);
        expect(screen.getByText('CCS2 • 50kW')).toBeInTheDocument();
    });

    it('should render Type2 connector', () => {
        render(<ConnectorChip type="Type2" powerKW={22} />);
        expect(screen.getByText('Type2 • 22kW')).toBeInTheDocument();
    });

    it('should render CHAdeMO connector', () => {
        render(<ConnectorChip type="CHAdeMO" powerKW={100} />);
        expect(screen.getByText('CHAdeMO • 100kW')).toBeInTheDocument();
    });

    it('should render decimal power values', () => {
        render(<ConnectorChip type="CCS2" powerKW={150.5} />);
        expect(screen.getByText('CCS2 • 150.5kW')).toBeInTheDocument();
    });

    it('should render zero power', () => {
        render(<ConnectorChip type="Type2" powerKW={0} />);
        expect(screen.getByText('Type2 • 0kW')).toBeInTheDocument();
    });

    it('should have small size', () => {
        const { container } = render(<ConnectorChip type="CCS2" powerKW={50} />);
        const chip = container.querySelector('.MuiChip-root');
        expect(chip).toHaveClass('MuiChip-sizeSmall');
    });
});
