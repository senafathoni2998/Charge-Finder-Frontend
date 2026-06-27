import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginRequest } from '../loginRoute';
import * as loginStorage from '../loginStorage';

// Mock dependencies
vi.mock('../loginStorage');

// Mock Redux store and authSlice
vi.mock('../../../app/store', () => ({
    default: {
        dispatch: vi.fn(),
    },
}));

vi.mock('../../../features/auth/authSlice', () => ({
    login: vi.fn(() => ({ type: 'login/test' })),
}));

// Input validation (email format, password presence) is now handled by the form
// via zodResolver(loginSchema) before loginRequest is ever called, so these tests
// cover only the API call + session side-effects.
describe('loginRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    it('returns an error when the backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';

        const result = await loginRequest({
            email: 'test@example.com',
            password: 'password123',
            remember: false,
        });

        expect(result).toEqual({ ok: false, error: 'Backend URL is not configured.' });
    });

    it('calls the backend API with the correct payload', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 'user-123',
                        email: 'test@example.com',
                        name: 'Test User',
                        region: 'US',
                        role: 'user',
                        token: 'auth-token-456',
                    },
                }),
            })
        ) as any;

        const result = await loginRequest({
            email: 'test@example.com',
            password: 'password123',
            remember: true,
        });

        expect(fetch).toHaveBeenCalledWith(
            'https://api.test.com/auth/login',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123',
                }),
            })
        );
        expect(result).toEqual({ ok: true });
    });

    it('returns an error when the backend returns a non-OK response', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid credentials' }),
            })
        ) as any;

        const result = await loginRequest({
            email: 'test@example.com',
            password: 'wrong-password',
            remember: false,
        });

        expect(result).toEqual({ ok: false, error: 'Invalid credentials' });
    });

    it('persists the login session with the correct data', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 'user-789',
                        email: 'persist@example.com',
                        name: 'Persist User',
                        region: 'EU',
                        role: 'admin',
                        token: 'persist-token',
                    },
                }),
            })
        ) as any;

        await loginRequest({
            email: 'persist@example.com',
            password: 'password123',
            remember: true,
        });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith({
            token: 'persist-token',
            userId: 'user-789',
            email: 'persist@example.com',
            region: 'EU',
            role: 'admin',
            remember: true,
        });
    });

    it('handles missing user data gracefully', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: {} }),
            })
        ) as any;

        await loginRequest({
            email: 'test@example.com',
            password: 'password123',
            remember: false,
        });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith(
            expect.objectContaining({
                token: undefined,
                userId: '',
                email: 'test@example.com',
                region: null,
            })
        );
    });

    it('coerces a numeric user id to a string', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 12345, email: 'numeric@example.com' },
                }),
            })
        ) as any;

        await loginRequest({
            email: 'numeric@example.com',
            password: 'password123',
            remember: false,
        });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith(
            expect.objectContaining({ userId: '12345' })
        );
    });

    it('handles network errors', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

        const result = await loginRequest({
            email: 'test@example.com',
            password: 'password123',
            remember: false,
        });

        expect(result).toEqual({ ok: false, error: 'Network error' });
    });

    it('returns { ok: true } on a successful login', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 'user-123', email: 'test@example.com' },
                }),
            })
        ) as any;

        const result = await loginRequest({
            email: 'test@example.com',
            password: 'password123',
            remember: false,
        });

        expect(result).toEqual({ ok: true });
    });
});
