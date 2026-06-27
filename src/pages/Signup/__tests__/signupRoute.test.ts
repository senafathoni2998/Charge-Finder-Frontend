import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupRequest } from '../signupRoute';
import * as signupStorage from '../signupStorage';

vi.mock('../../../app/store', () => ({
    default: {
        dispatch: vi.fn(),
    },
}));

vi.mock('../../../features/auth/authSlice', () => ({
    login: vi.fn(() => ({ type: 'login/test' })),
}));

vi.mock('../signupStorage', () => ({
    persistSignupSession: vi.fn(),
}));

const baseArgs = {
    name: 'Test User',
    region: 'Jakarta',
    email: 'test@example.com',
    password: 'password123',
    remember: true,
    image: null as File | null,
};

// Field validation (email/password/confirm) is handled by the form via
// zodResolver(signupFormSchema) before signupRequest runs, so these tests cover
// only the image-type guard + the API call + session side-effects.
describe('signupRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    it('rejects a non-image profile photo', async () => {
        const badFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
        const result = await signupRequest({ ...baseArgs, image: badFile });
        expect(result).toEqual({
            ok: false,
            error: 'Profile photo must be an image file.',
        });
    });

    it('returns an error when the backend URL is not configured', async () => {
        import.meta.env.VITE_APP_BACKEND_URL = '';
        const result = await signupRequest(baseArgs);
        expect(result).toEqual({ ok: false, error: 'Backend URL is not configured.' });
    });

    it('signs up successfully without an image (JSON body)', async () => {
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

        const result = await signupRequest(baseArgs);

        expect(fetch).toHaveBeenCalledWith(
            'https://api.test.com/auth/signup',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })
        );
        expect(signupStorage.persistSignupSession).toHaveBeenCalled();
        expect(result).toEqual({ ok: true });
    });

    it('signs up successfully with an image (multipart body)', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 'user-123', email: 'test@example.com' },
                }),
            })
        ) as any;

        const imageFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
        const result = await signupRequest({ ...baseArgs, image: imageFile });

        const [, options] = (fetch as any).mock.calls[0];
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.headers).toBeUndefined();
        expect(signupStorage.persistSignupSession).toHaveBeenCalled();
        expect(result).toEqual({ ok: true });
    });

    it('returns the server error message on a non-OK response', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Email already exists' }),
            })
        ) as any;

        const result = await signupRequest(baseArgs);
        expect(result).toEqual({ ok: false, error: 'Email already exists' });
    });

    it('handles network errors', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
        const result = await signupRequest(baseArgs);
        expect(result).toEqual({ ok: false, error: 'Network error' });
    });

    it('returns { ok: true } on a successful signup', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    user: { id: 'user-123', email: 'test@example.com' },
                }),
            })
        ) as any;

        const result = await signupRequest(baseArgs);
        expect(result).toEqual({ ok: true });
    });
});
