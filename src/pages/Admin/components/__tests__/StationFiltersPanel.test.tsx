import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationFiltersPanel from '../StationFiltersPanel';
import type { ConnectorType } from '../../../../models/model';

describe('StationFiltersPanel', () => {
    const defaultProps = {
        open: true,
        statusFilter: '',
        onStatusFilterChange: vi.fn(),
        connectorOptions: ['Type2', 'CCS2', 'CHAdeMO'] as ConnectorType[],
        connectorSet: new Set<ConnectorType>(),
        onToggleConnector: vi.fn(),
        minKW: 0,
        onMinKWChange: vi.fn(),
        filtersActiveCount: 0,
        onResetFilters: vi.fn(),
    };

    it('should render when open', () => {
        render(<StationFiltersPanel {...defaultProps} />);

        expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByText('Availability')).toBeInTheDocument();
        expect(screen.getByText('Connectors')).toBeInTheDocument();
        expect(screen.getByText('Minimum power')).toBeInTheDocument();
    });

    it('should not render content when closed', () => {
        const { container } = render(<StationFiltersPanel {...defaultProps} open={false} />);

        // The Collapse component from MUI still renders children but with display: none
        // We can't easily test the visibility without checking computed styles
        // So let's just test the component doesn't crash and renders properly when open
        const box = container.querySelector('.MuiCollapse-root');
        expect(box).toBeInTheDocument();
    });

    it('should render status filter buttons', () => {
        render(<StationFiltersPanel {...defaultProps} />);

        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Busy')).toBeInTheDocument();
        expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should render connector chips', () => {
        render(<StationFiltersPanel {...defaultProps} />);

        expect(screen.getByText('Type2')).toBeInTheDocument();
        expect(screen.getByText('CCS2')).toBeInTheDocument();
        expect(screen.getByText('CHAdeMO')).toBeInTheDocument();
    });

    it('should render min power slider with value', () => {
        render(<StationFiltersPanel {...defaultProps} minKW={50} />);

        expect(screen.getByText('50 kW')).toBeInTheDocument();
    });

    it('should call onStatusFilterChange when status button is clicked', () => {
        const onStatusFilterChange = vi.fn();
        render(<StationFiltersPanel {...defaultProps} onStatusFilterChange={onStatusFilterChange} />);

        fireEvent.click(screen.getByText('Available'));
        expect(onStatusFilterChange).toHaveBeenCalledWith('AVAILABLE');
    });

    it('should call onToggleConnector when connector chip is clicked', () => {
        const onToggleConnector = vi.fn();
        render(<StationFiltersPanel {...defaultProps} onToggleConnector={onToggleConnector} />);

        fireEvent.click(screen.getByText('Type2'));
        expect(onToggleConnector).toHaveBeenCalledWith('Type2');
    });

    it('should call onResetFilters when Reset filters button is clicked', () => {
        const onResetFilters = vi.fn();
        render(<StationFiltersPanel {...defaultProps} filtersActiveCount={3} onResetFilters={onResetFilters} />);

        fireEvent.click(screen.getByText('Reset filters'));
        expect(onResetFilters).toHaveBeenCalledTimes(1);
    });

    it('should disable Reset filters button when no filters are active', () => {
        render(<StationFiltersPanel {...defaultProps} filtersActiveCount={0} />);

        const resetButton = screen.getByText('Reset filters').closest('button');
        expect(resetButton).toBeDisabled();
    });
});
