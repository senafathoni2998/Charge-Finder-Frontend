import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserListItem from '../UserListItem';
import type { AdminUser } from '../../types';

describe('UserListItem', () => {
    const mockUser: AdminUser = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'admin',
        status: 'active',
        lastActive: '5m ago',
    };

    it('should render user details', () => {
        render(<UserListItem user={mockUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('Last active: 5m ago')).toBeInTheDocument();
    });

    it('should render role chip', () => {
        render(<UserListItem user={mockUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should render status chip', () => {
        render(<UserListItem user={mockUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should render action button for non-active users', () => {
        const suspendedUser: AdminUser = { ...mockUser, status: 'suspended' };
        render(<UserListItem user={suspendedUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    it('should render action button for pending users', () => {
        const pendingUser: AdminUser = { ...mockUser, status: 'pending' };
        render(<UserListItem user={pendingUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('should not render action button for active users', () => {
        render(<UserListItem user={mockUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.queryByText('Suspend')).not.toBeInTheDocument();
        expect(screen.queryByText('Activate')).not.toBeInTheDocument();
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    });

    it('should call onStatusAction when action button is clicked', () => {
        const onStatusAction = vi.fn();
        const suspendedUser: AdminUser = { ...mockUser, status: 'suspended' };

        render(<UserListItem user={suspendedUser} isUpdating={false} onStatusAction={onStatusAction} onOpenMenu={vi.fn()} />);

        fireEvent.click(screen.getByText('Activate'));
        expect(onStatusAction).toHaveBeenCalledWith(suspendedUser);
    });

    it('should disable action button when updating', () => {
        const suspendedUser: AdminUser = { ...mockUser, status: 'suspended' };
        render(<UserListItem user={suspendedUser} isUpdating={true} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        const button = screen.getByText('Activate').closest('button');
        expect(button).toBeDisabled();
    });

    it('should call onOpenMenu when menu button is clicked', () => {
        const onOpenMenu = vi.fn();
        render(<UserListItem user={mockUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={onOpenMenu} />);

        const menuButton = screen.getByLabelText('User actions');
        fireEvent.click(menuButton);

        expect(onOpenMenu).toHaveBeenCalledTimes(1);
        expect(onOpenMenu).toHaveBeenCalledWith(expect.anything(), mockUser);
    });

    it('should render operator role chip', () => {
        const operatorUser: AdminUser = { ...mockUser, role: 'operator' };
        render(<UserListItem user={operatorUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('operator')).toBeInTheDocument();
    });

    it('should render user role chip', () => {
        const normalUser: AdminUser = { ...mockUser, role: 'user' };
        render(<UserListItem user={normalUser} isUpdating={false} onStatusAction={vi.fn()} onOpenMenu={vi.fn()} />);

        expect(screen.getByText('user')).toBeInTheDocument();
    });
});
