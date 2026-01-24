import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserManagementCard from '../UserManagementCard';
import type { AdminUser } from '../../types';

vi.mock('../UserList', () => ({
    default: ({ users, isLoading, onOpenMenu }: any) =>
        isLoading ? (
            <div>Loading...</div>
        ) : (
            <div data-testid="user-list">
                {users.map((u: AdminUser) => (
                    <div key={u.id}>{u.name}</div>
                ))}
                <button onClick={(e) => onOpenMenu(e, users[0])}>Open Menu</button>
            </div>
        ),
}));

describe('UserManagementCard', () => {
    const mockUsers: AdminUser[] = [
        {
            id: 'u1',
            name: 'John Doe',
            email: 'john@test.com',
            role: 'admin',
            status: 'active',
            lastActive: '5m ago',
        },
        {
            id: 'u2',
            name: 'Jane Smith',
            email: 'jane@test.com',
            role: 'user',
            status: 'pending',
            lastActive: 'N/A',
        },
    ];

    const defaultProps = {
        users: mockUsers,
        usersLoading: false,
        usersError: null,
        userActionError: null,
        usersUpdating: {},
        onStatusAction: vi.fn(),
        onOpenMenu: vi.fn(),
        onAddUser: vi.fn(),
    };

    it('should render title and description', () => {
        render(<UserManagementCard {...defaultProps} />);

        expect(screen.getByText('User management')).toBeInTheDocument();
        expect(screen.getByText(/Manage roles, access, and account health/)).toBeInTheDocument();
    });

    it('should render search input', () => {
        render(<UserManagementCard {...defaultProps} />);

        expect(screen.getByPlaceholderText('Search users or emails')).toBeInTheDocument();
    });

    it('should render Add user button', () => {
        render(<UserManagementCard {...defaultProps} />);

        expect(screen.getByText('Add user')).toBeInTheDocument();
    });

    it('should call onAddUser when Add user button is clicked', () => {
        const onAddUser = vi.fn();
        render(<UserManagementCard {...defaultProps} onAddUser={onAddUser} />);

        fireEvent.click(screen.getByText('Add user'));
        expect(onAddUser).toHaveBeenCalledTimes(1);
    });

    it('should render error message when user action error exists', () => {
        render(<UserManagementCard {...defaultProps} userActionError="Failed to delete user" />);

        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });

    it('should render user list', () => {
        render(<UserManagementCard {...defaultProps} />);

        expect(screen.getByTestId('user-list')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render loading state', () => {
        render(<UserManagementCard {...defaultProps} usersLoading={true} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render error when no user action error', () => {
        const { container } = render(<UserManagementCard {...defaultProps} userActionError={null} />);

        expect(container.querySelector('[style*="rgba(244,67,54,0.9)"]')).not.toBeInTheDocument();
    });

    it('should render search input with icon', () => {
        const { container } = render(<UserManagementCard {...defaultProps} />);

        const input = container.querySelector('input[type="text"]');
        expect(input).toBeInTheDocument();
    });
});
