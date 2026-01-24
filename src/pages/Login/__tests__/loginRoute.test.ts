import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction } from '../loginRoute';
import * as validate from '../../../utils/validate';
import * as loginStorage from '../loginStorage';

// Mock dependencies
vi.mock('../../../utils/validate');
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

describe('loginAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set environment variable
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    it('should return error when email is invalid', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(false);

        const formData = new FormData();
        formData.append('email', 'invalid-email');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        expect(result).toEqual({
            error: 'Please enter a valid email address.',
        });
    });

    it('should return error when password has issues', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue('Password is too short');

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', '123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        expect(result).toEqual({
            error: 'Password is too short',
        });
    });

    it('should return error when backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';

        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        expect(result).toEqual({
            error: 'Backend URL is not configured.',
        });
    });

    it('should call backend API with correct payload', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

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

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('remember', '1');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        await loginAction({ request });

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
    });

    it('should return error when backend returns non-OK response', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid credentials' }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'wrong-password');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        expect(result).toEqual({
            error: 'Invalid credentials',
        });
    });

    it('should persist login session with correct data', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

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

        const formData = new FormData();
        formData.append('email', 'persist@example.com');
        formData.append('password', 'password123');
        formData.append('remember', '1');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        await loginAction({ request });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith({
            token: 'persist-token',
            userId: 'user-789',
            email: 'persist@example.com',
            region: 'EU',
            role: 'admin',
            remember: true,
        });
    });

    it('should handle missing user data gracefully', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {},
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        await loginAction({ request });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith(
            expect.objectContaining({
                token: undefined,
                userId: '',
                email: 'test@example.com',
                region: null,
            })
        );
    });

    it('should handle numeric user id', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 12345,
                        email: 'numeric@example.com',
                    },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'numeric@example.com');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        await loginAction({ request });

        expect(loginStorage.persistLoginSession).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: '12345',
            })
        );
    });

    it('should handle network errors', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        expect(result).toEqual({
            error: 'Network error',
        });
    });

    it('should return a redirect response on successful login', async () => {
        vi.mocked(validate.isValidEmail).mockReturnValue(true);
        vi.mocked(validate.passwordIssue).mockReturnValue(null);

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 'user-123',
                        email: 'test@example.com',
                    },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const request = new Request('http://localhost:3000/login?next=/admin', {
            method: 'POST',
            body: formData,
        });

        const result = await loginAction({ request });

        // Should return a Response object (redirect)
        expect(result).toBeDefined();
        // Response objects are instances of Response
        expect(result instanceof Response).toBe(true);
    });
});
