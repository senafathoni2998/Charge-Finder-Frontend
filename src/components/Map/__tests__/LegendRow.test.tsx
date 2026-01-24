import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LegendRow from '../LegendRow';

describe('LegendRow', () => {
    it('should render label', () => {
        const label = 'Test Label';
        const color = '#ff0000';
        render(<LegendRow label={label} color={color} />);

        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
