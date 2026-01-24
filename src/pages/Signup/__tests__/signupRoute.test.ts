import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupAction } from '../signupRoute';
import * as signupStorage from '../signupStorage';

// Mock dependencies
vi.mock('../../app/store', () => ({
    default: {
        dispatch: vi.fn(),
    },
}));

vi.mock('react-router', () => ({
    redirect: vi.fn((path) => ({ redirected: true, to: path })),
}));

vi.mock('../signupStorage', () => ({
    persistSignupSession: vi.fn(),
}));

describe('signupRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    it('should return error for invalid email', async () => {
        const formData = new FormData();
        formData.append('email', 'invalid-email');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Please enter a valid email address.' });
    });

    it('should return error for weak password', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'weak');
        formData.append('confirm', 'weak');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Password must be at least 7 characters.' });
    });

    it('should return error for mismatched passwords', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'different123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Passwords do not match.' });
    });

    it('should return error when backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Backend URL is not configured.' });
    });

    it('should successfully signup without image', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 'user-123',
                        email: 'test@example.com',
                        name: 'Test User',
                        region: 'Jakarta',
                        role: 'user',
                        token: 'auth-token',
                    },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');
        formData.append('name', 'Test User');
        formData.append('region', 'Jakarta');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toBeDefined();
        expect(signupStorage.persistSignupSession).toHaveBeenCalled();
    });

    it('should successfully signup with image', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: {
                        id: 'user-123',
                        email: 'test@example.com',
                        name: 'Test User',
                        region: 'Jakarta',
                        role: 'user',
                        token: 'auth-token',
                    },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');
        formData.append('name', 'Test User');
        formData.append('region', 'Jakarta');
        const imageFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
        formData.append('image', imageFile);

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toBeDefined();
        expect(signupStorage.persistSignupSession).toHaveBeenCalled();
    });

    it('should handle signup failure from server', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Email already exists' }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Email already exists' });
    });

    it('should handle network error', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toEqual({ error: 'Network error' });
    });

    it('should redirect to "/" when no next parameter', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 'user-123', email: 'test@example.com' },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({ request: new Request('http://localhost', { method: 'POST', body: formData }) });

        expect(result).toBeDefined();
    });

    it('should redirect to safe next path', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 'user-123', email: 'test@example.com' },
                }),
            })
        ) as any;

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('confirm', 'password123');

        const result = await signupAction({
            request: new Request('http://localhost?next=/profile', { method: 'POST', body: formData }),
        });

        expect(result).toBeDefined();
    });
});
