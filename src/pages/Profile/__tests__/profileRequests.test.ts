import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfileRequest, changePasswordRequest } from '../profileRequests';

describe('updateProfileRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    const base = { userId: 'user-1', name: 'Jane', region: 'Jakarta', image: null as File | null };

    it('requires a userId', async () => {
        const result = await updateProfileRequest({ ...base, userId: '' });
        expect(result).toEqual({ ok: false, error: 'User session is missing.' });
    });

    it('rejects a non-image file', async () => {
        const bad = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
        const result = await updateProfileRequest({ ...base, image: bad });
        expect(result).toEqual({
            ok: false,
            error: 'Profile photo must be an image file.',
        });
    });

    it('errors when the backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';
        const result = await updateProfileRequest(base);
        expect(result).toEqual({ ok: false, error: 'Backend URL is not configured.' });
    });

    it('PATCHes a multipart body and returns ok on success', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        ) as any;

        const result = await updateProfileRequest(base);

        const [url, options] = (fetch as any).mock.calls[0];
        expect(url).toBe('https://api.test.com/profile/update-profile');
        expect(options.method).toBe('PATCH');
        expect(options.credentials).toBe('include');
        expect(options.body).toBeInstanceOf(FormData);
        expect(result).toEqual({ ok: true });
    });

    it('returns the server error message on a non-OK response', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Nope' }) })
        ) as any;
        const result = await updateProfileRequest(base);
        expect(result).toEqual({ ok: false, error: 'Nope' });
    });

    it('handles network errors', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
        const result = await updateProfileRequest(base);
        expect(result).toEqual({ ok: false, error: 'Network error' });
    });
});

describe('changePasswordRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    const base = { userId: 'user-1', currentPassword: 'old123456', newPassword: 'new123456' };

    it('requires a userId', async () => {
        const result = await changePasswordRequest({ ...base, userId: '' });
        expect(result).toEqual({ ok: false, error: 'User session is missing.' });
    });

    it('errors when the backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';
        const result = await changePasswordRequest(base);
        expect(result).toEqual({ ok: false, error: 'Backend URL is not configured.' });
    });

    it('PATCHes a JSON body and returns ok on success', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        ) as any;

        const result = await changePasswordRequest(base);

        expect(fetch).toHaveBeenCalledWith(
            'https://api.test.com/profile/update-password',
            expect.objectContaining({
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: 'user-1',
                    currentPassword: 'old123456',
                    newPassword: 'new123456',
                }),
            })
        );
        expect(result).toEqual({ ok: true });
    });

    it('returns the server error message on a non-OK response', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Wrong password' }) })
        ) as any;
        const result = await changePasswordRequest(base);
        expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('handles network errors', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
        const result = await changePasswordRequest(base);
        expect(result).toEqual({ ok: false, error: 'Network error' });
    });
});
