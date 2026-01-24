import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useUserManagement from '../useUserManagement';
import * as usersApi from '../../../../api/users';

vi.mock('../../../../api/users');

describe('useUserManagement', () => {
    const mockUsers = [
        { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'admin', status: 'active', lastActive: '5m ago' },
        { id: 'u2', name: 'Jane Smith', email: 'jane@test.com', role: 'user', status: 'pending', lastActive: 'N/A' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (usersApi.fetchUsers as any).mockResolvedValue({ ok: true, users: mockUsers });
    });

    it('should fetch users on mount', async () => {
        const { result } = renderHook(() => useUserManagement());

        expect(result.current.usersLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.usersLoading).toBe(false);
        });

        expect(result.current.users).toHaveLength(2);
        expect(usersApi.fetchUsers).toHaveBeenCalled();
    });

    it('should handle fetch users error', async () => {
        (usersApi.fetchUsers as any).mockResolvedValue({ ok: false, error: 'Failed to fetch' });

        const { result } = renderHook(() => useUserManagement());

        await waitFor(() => {
            expect(result.current.usersLoading).toBe(false);
        });

        expect(result.current.usersError).toBe('Failed to fetch');
        expect(result.current.users).toHaveLength(0);
    });

    it('should open and close user menu', async () => {
        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        const mockEvent = { currentTarget: document.createElement('div') } as any;

        act(() => {
            result.current.openUserMenu(mockEvent, mockUsers[0] as any);
        });

        expect(result.current.userMenuAnchorEl).toBe(mockEvent.currentTarget);
        expect(result.current.userMenuTarget).toEqual(mockUsers[0]);

        act(() => {
            result.current.closeUserMenu();
        });

        expect(result.current.userMenuAnchorEl).toBeNull();
        expect(result.current.userMenuTarget).toBeNull();
    });

    it('should handle user status action', async () => {
        (usersApi.patchUser as any).mockResolvedValue({
            ok: true,
            user: { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'admin', status: 'suspended' }
        });

        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        await act(async () => {
            await result.current.handleUserStatusAction(mockUsers[0] as any);
        });

        expect(usersApi.patchUser).toHaveBeenCalledWith({
            userId: 'u1',
            data: { status: 'suspended' }
        });
    });

    it('should handle user status action error', async () => {
        (usersApi.patchUser as any).mockResolvedValue({ ok: false, error: 'Update failed' });

        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        await act(async () => {
            await result.current.handleUserStatusAction(mockUsers[0] as any);
        });

        expect(result.current.userActionError).toBe('Update failed');
    });

    it('should delete user with confirmation', async () => {
        (usersApi.deleteUser as any).mockResolvedValue({ ok: true });
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        await act(async () => {
            await result.current.handleDeleteUser(mockUsers[0] as any);
        });

        expect(usersApi.deleteUser).toHaveBeenCalledWith('u1');
        expect(result.current.users).toHaveLength(1);
        expect(result.current.users[0].id).toBe('u2');
    });

    it('should not delete user without confirmation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        await act(async () => {
            await result.current.handleDeleteUser(mockUsers[0] as any);
        });

        expect(usersApi.deleteUser).not.toHaveBeenCalled();
        expect(result.current.users).toHaveLength(2);
    });

    it('should handle delete user error', async () => {
        (usersApi.deleteUser as any).mockResolvedValue({ ok: false, error: 'Delete failed' });
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() => useUserManagement());
        await waitFor(() => expect(result.current.usersLoading).toBe(false));

        await act(async () => {
            await result.current.handleDeleteUser(mockUsers[0] as any);
        });

        expect(result.current.userActionError).toBe('Delete failed');
    });
});
