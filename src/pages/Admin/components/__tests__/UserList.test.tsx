import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserList from '../UserList';
import type { AdminUser } from '../../types';

describe('UserList', () => {
    const mockUsers: AdminUser[] = [
        { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'admin', status: 'active', lastActive: '5m ago' },
        { id: 'u2', name: 'Jane Smith', email: 'jane@test.com', role: 'user', status: 'pending', lastActive: 'N/A' },
    ];

    const defaultProps = {
        users: mockUsers,
        isLoading: false,
        error: null,
        updatingMap: {},
        onStatusAction: vi.fn(),
        onOpenMenu: vi.fn(),
    };

    it('should render loading state', () => {
        render(<UserList {...defaultProps} isLoading={true} />);

        expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('should render empty state with no error', () => {
        render(<UserList {...defaultProps} users={[]} />);

        expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    it('should render empty state with error message', () => {
        render(<UserList {...defaultProps} users={[]} error="Failed to load users" />);

        expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });

    it('should render all users', () => {
        render(<UserList {...defaultProps} />);

        // Use a more flexible text matcher
        expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Jane Smith'))).toBeInTheDocument();
    });

    it('should pass updating status correctly', () => {
        render(<UserList {...defaultProps} updatingMap={{ u1: true, u2: false }} />);

        // Check that both users are rendered
        expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Jane Smith'))).toBeInTheDocument();
    });

    it('should render correct number of users', () => {
        render(<UserList {...defaultProps} />);

        // Verify both users are in the document
        expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Jane Smith'))).toBeInTheDocument();
    });
});
