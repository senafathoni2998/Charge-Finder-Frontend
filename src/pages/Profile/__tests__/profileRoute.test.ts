import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileLoader, profileAction } from '../profileRoute';
import * as profileStorage from '../profileStorage';

const mockDispatch = vi.fn();

vi.mock('../profileStorage', () => ({
    readStoredActiveCarId: vi.fn(() => 'car-1'),
    readStoredAuthToken: vi.fn(() => 'token-123'),
    clearAuthStorage: vi.fn(),
}));

vi.mock('../../app/store', () => ({
    default: {
        dispatch: mockDispatch,
    },
}));

vi.mock('../../utils/session', () => ({
    persistSessionMessage: vi.fn(),
}));

vi.mock('react-router', () => ({
    redirect: vi.fn((path) => ({ redirected: true, to: path })),
}));

// Profile edits + password changes are now client-side react-hook-form forms
// (see profileRequests.ts / its tests); profileAction only handles logout.
describe('profileRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    describe('profileLoader', () => {
        it('should return default data when window is undefined', async () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            const result = await profileLoader({ request: new Request('http://localhost') });

            expect(result).toEqual({
                user: null,
                vehicles: null,
                activeCarId: null,
            });

            (globalThis as any).window = originalWindow;
        });

        it('should return default data when no token', async () => {
            vi.mocked(profileStorage.readStoredAuthToken).mockReturnValueOnce(null);

            const result = await profileLoader({ request: new Request('http://localhost') });

            expect(result).toEqual({
                user: null,
                vehicles: null,
                activeCarId: 'car-1',
            });
        });

        it('should return default data when no backend URL', async () => {
            import.meta.env.VITE_APP_BACKEND_URL = '';

            const result = await profileLoader({ request: new Request('http://localhost') });

            expect(result).toEqual({
                user: null,
                vehicles: null,
                activeCarId: 'car-1',
            });
        });

        it('should fetch profile and vehicles data', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ user: { name: 'John', region: 'US' } }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ vehicles: [] }),
                }) as any;

            await profileLoader({ request: new Request('http://localhost') });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/profile',
                expect.objectContaining({ credentials: 'include' })
            );
            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles',
                expect.objectContaining({ credentials: 'include' })
            );
        });

        it('should handle 401 unauthorized response', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({}),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ vehicles: [] }),
                }) as any;

            await profileLoader({ request: new Request('http://localhost') });

            expect(profileStorage.clearAuthStorage).toHaveBeenCalled();
        });

        it('should handle 403 forbidden response', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ user: { name: 'John' } }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    json: () => Promise.resolve({}),
                }) as any;

            await profileLoader({ request: new Request('http://localhost') });

            expect(profileStorage.clearAuthStorage).toHaveBeenCalled();
        });

        it('should extract user data correctly', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ user: { name: 'John', region: 'Jakarta', role: 'user' } }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ vehicles: [] }),
                }) as any;

            const result = await profileLoader({ request: new Request('http://localhost') });

            expect(result.user).toEqual({
                name: 'John',
                region: 'Jakarta',
                role: 'user',
            });
        });

        it('should extract vehicles data correctly', async () => {
            const mockVehicles = [
                { id: 'car-1', name: 'Tesla' },
                { id: 'car-2', name: 'Nissan' },
            ];

            global.fetch = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ user: null }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ vehicles: mockVehicles }),
                }) as any;

            const result = await profileLoader({ request: new Request('http://localhost') });

            expect(result.vehicles).toEqual(mockVehicles);
        });
    });

    describe('profileAction', () => {
        it('should handle logout intent', async () => {
            const formData = new FormData();
            formData.append('intent', 'logout');

            global.fetch = vi.fn(() =>
                Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
            ) as any;

            const result = await profileAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

            expect(result).toBeDefined();
            expect(profileStorage.clearAuthStorage).toHaveBeenCalled();
        });

        it('should return an error for an unknown intent', async () => {
            const formData = new FormData();
            formData.append('intent', 'unknown');

            const result = await profileAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

            expect(result).toEqual({ error: 'Unknown action.' });
        });
    });
});
