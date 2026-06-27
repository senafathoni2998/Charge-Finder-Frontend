import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserRequest } from '../addUserRoute';
import * as api from '../../../api/users';

vi.mock('../../../api/users');

// Field validation (name/email/role/password/region) is handled by the form via
// zodResolver(addUserFormSchema) before createUserRequest runs.
describe('createUserRequest', () => {
    const values = {
        name: 'Valid Name',
        email: 'test@test.com',
        role: 'user',
        password: 'Password123!',
        region: 'Jakarta',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls createUser and returns ok on success', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ ok: true, user: { id: 'u1' } } as any);

        const result = await createUserRequest(values);

        expect(api.createUser).toHaveBeenCalledWith(values);
        expect(result).toEqual({ ok: true });
    });

    it('returns the API error', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ ok: false, error: 'Taken' } as any);

        const result = await createUserRequest(values);

        expect(result).toEqual({ ok: false, error: 'Taken' });
    });

    it('falls back to a generic error message', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ ok: false } as any);

        const result = await createUserRequest(values);

        expect(result).toEqual({ ok: false, error: 'Could not add user.' });
    });
});
