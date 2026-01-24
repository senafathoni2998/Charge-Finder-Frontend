import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserActionsMenu from '../UserActionsMenu';
import type { AdminUser } from '../../types';

describe('UserActionsMenu', () => {
    const mockUser: AdminUser = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'admin',
        status: 'active',
        lastActive: '5m ago',
    };

    const defaultProps = {
        anchorEl: document.createElement('div'),
        user: mockUser,
        isDeleting: false,
        onClose: vi.fn(),
        onDelete: vi.fn(),
    };

    it('should render menu when open', () => {
        render(<UserActionsMenu {...defaultProps} />);

        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not render menu when closed', () => {
        render(<UserActionsMenu {...defaultProps} anchorEl={null} />);

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should call onDelete and onClose when Delete is clicked', () => {
        const onDelete = vi.fn();
        const onClose = vi.fn();

        render(<UserActionsMenu {...defaultProps} onDelete={onDelete} onClose={onClose} />);

        fireEvent.click(screen.getByText('Delete'));

        expect(onDelete).toHaveBeenCalledWith(mockUser);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should disable Delete when isDeleting', () => {
        render(<UserActionsMenu {...defaultProps} isDeleting={true} />);

        const deleteButton = screen.getByText('Delete').closest('li');
        expect(deleteButton).toHaveClass('Mui-disabled');
    });

    it('should disable Delete when no user', () => {
        render(<UserActionsMenu {...defaultProps} user={null} />);

        const deleteButton = screen.getByText('Delete').closest('li');
        expect(deleteButton).toHaveClass('Mui-disabled');
    });

    it('should have correct styling for delete button', () => {
        const { container } = render(<UserActionsMenu {...defaultProps} />);

        const menuItem = screen.getByText('Delete').closest('li');
        expect(menuItem).toHaveStyle({ color: 'rgba(244,67,54,0.95)' });
    });
});
