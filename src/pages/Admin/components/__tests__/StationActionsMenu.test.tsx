import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StationActionsMenu from '../StationActionsMenu';
import type { Station } from '../../../../models/model';

describe('StationActionsMenu', () => {
    const mockStation: Station = {
        id: 's1',
        name: 'Test Station',
        address: '123 Test St',
        status: 'AVAILABLE',
        lastUpdatedISO: '2025-01-24T10:00:00Z',
        connectors: [{ type: 'Type2', powerKW: 22, ports: 2, availablePorts: 2 }],
        coordinates: { lat: 50, lng: 10 },
    };

    const defaultProps = {
        anchorEl: document.createElement('div'),
        station: mockStation,
        isDeleting: false,
        onClose: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    it('should render menu items when open', () => {
        render(<StationActionsMenu {...defaultProps} />);

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not render menu when closed', () => {
        render(<StationActionsMenu {...defaultProps} anchorEl={null} />);

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should call onEdit and onClose when Edit is clicked', () => {
        const onEdit = vi.fn();
        const onClose = vi.fn();

        render(<StationActionsMenu {...defaultProps} onEdit={onEdit} onClose={onClose} />);

        fireEvent.click(screen.getByText('Edit'));

        expect(onEdit).toHaveBeenCalledWith(mockStation);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete and onClose when Delete is clicked', () => {
        const onDelete = vi.fn();
        const onClose = vi.fn();

        render(<StationActionsMenu {...defaultProps} onDelete={onDelete} onClose={onClose} />);

        fireEvent.click(screen.getByText('Delete'));

        expect(onDelete).toHaveBeenCalledWith(mockStation);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should disable Edit when no station', () => {
        render(<StationActionsMenu {...defaultProps} station={null} />);

        const editButton = screen.getByText('Edit').closest('li');
        expect(editButton).toHaveClass('Mui-disabled');
    });

    it('should disable Delete when isDeleting', () => {
        render(<StationActionsMenu {...defaultProps} isDeleting={true} />);

        const deleteButton = screen.getByText('Delete').closest('li');
        expect(deleteButton).toHaveClass('Mui-disabled');
    });

    it('should disable Delete when no station', () => {
        render(<StationActionsMenu {...defaultProps} station={null} />);

        const deleteButton = screen.getByText('Delete').closest('li');
        expect(deleteButton).toHaveClass('Mui-disabled');
    });
});
