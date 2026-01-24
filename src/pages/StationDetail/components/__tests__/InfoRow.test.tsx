import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoRow from '../InfoRow';

describe('InfoRow', () => {
    it('should render without crashing', () => {
        render(<InfoRow label="Test Label" value="Test Value" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('should render the label correctly', () => {
        render(<InfoRow label="Status" value="Available" />);
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render the value correctly', () => {
        render(<InfoRow label="Status" value="Available" />);
        expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should render with empty string values', () => {
        render(<InfoRow label="Empty" value="" />);
        expect(screen.getByText('Empty')).toBeInTheDocument();
        expect(screen.getByText('')).toBeInTheDocument();
    });

    it('should render with special characters', () => {
        render(<InfoRow label="Price" value="$10.00/kWh" />);
        expect(screen.getByText('Price')).toBeInTheDocument();
        expect(screen.getByText('$10.00/kWh')).toBeInTheDocument();
    });
});
