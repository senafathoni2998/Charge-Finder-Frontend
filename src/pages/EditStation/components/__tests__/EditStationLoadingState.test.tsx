import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditStationLoadingState from '../EditStationLoadingState';

describe('EditStationLoadingState', () => {
    it('should render EditStationHeader with loading subtitle', () => {
        render(<EditStationLoadingState />);

        expect(screen.getByText('Edit station')).toBeInTheDocument();
        expect(screen.getByText('Loading station data...')).toBeInTheDocument();
    });

    it('should render loading message box', () => {
        render(<EditStationLoadingState />);

        expect(screen.getByText('Loading station details...')).toBeInTheDocument();
    });
});
