import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StationHeader from '../StationHeader';

describe('StationHeader', () => {
    it('should render default title', () => {
        render(<StationHeader />);
        expect(screen.getByText('Add station')).toBeInTheDocument();
        expect(screen.getByText(/Create and maintain station details/)).toBeInTheDocument();
    });

    it('should render custom title', () => {
        render(<StationHeader title="New Station" subtitle="Subtitle" />);
        expect(screen.getByText('New Station')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});
