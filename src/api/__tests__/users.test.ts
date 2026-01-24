import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUsers, patchUser, deleteUser, createUser } from '../users';

describe('users API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('fetchUsers', () => {
    it('should return error if backend URL is not configured', async () => {
      vi.stubEnv('VITE_APP_BACKEND_URL', '');
      const result = await fetchUsers();
      expect(result).toEqual({ ok: false, users: [], error: "Backend URL is not configured." });
    });

    it('should return users successfully', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' }];
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ users: mockUsers }),
      });

      const result = await fetchUsers();
      expect(result).toEqual({ ok: true, users: mockUsers });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admin/users`, expect.objectContaining({ method: 'GET' }));
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Failed to load users' }),
      });

      const result = await fetchUsers();
      expect(result).toEqual({ ok: false, users: [], error: 'Failed to load users' });
    });
  });

  describe('patchUser', () => {
    const userId = '123';
    const updateData = { name: 'Updated User' };

    it('should return error if userId is missing', async () => {
      const result = await patchUser({ userId: '', data: updateData });
      expect(result).toEqual({ ok: false, user: null, error: "User ID is missing." });
    });

    it('should update user successfully', async () => {
      const mockUser = { id: userId, ...updateData };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const result = await patchUser({ userId, data: updateData });
      expect(result).toEqual({ ok: true, user: mockUser });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admin/users/${userId}`, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }));
    });
  });

  describe('deleteUser', () => {
    const userId = '123';

    it('should return error if userId is missing', async () => {
      const result = await deleteUser('');
      expect(result).toEqual({ ok: false, error: "User ID is missing." });
    });

    it('should delete user successfully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await deleteUser(userId);
      expect(result).toEqual({ ok: true });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admin/users/${userId}`, expect.objectContaining({ method: 'DELETE' }));
    });
  });

  describe('createUser', () => {
    const validPayload = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
    };

    it('should create user successfully', async () => {
      const mockUser = { id: '123', ...validPayload };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const result = await createUser(validPayload);
      expect(result).toEqual({ ok: true, user: mockUser });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admin/users`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validPayload),
      }));
    });
  });
});
