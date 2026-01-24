import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addUserAction } from '../addUserRoute';
import * as router from 'react-router';
import * as api from '../../../api/users';

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        redirect: vi.fn((path) => ({ type: 'redirect', path })),
    };
});

vi.mock('../../../api/users');

describe('addUserRoute', () => {
    const createRequest = (formData: Record<string, string>) => ({
        formData: async () => {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            return fd;
        }
    } as unknown as Request);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return error for invalid name', async () => {
        const req = createRequest({ name: 'A' }); // Too short
        const res = await addUserAction({ request: req });
        expect(res).toHaveProperty('error', expect.stringContaining('Name must be'));
    });

    it('should return error for invalid email', async () => {
        const req = createRequest({ name: 'Valid Name', email: 'invalid' });
        const res = await addUserAction({ request: req });
        expect(res).toHaveProperty('error', expect.stringContaining('valid email'));
    });

    it('should return error for invalid role', async () => {
        const req = createRequest({ name: 'Valid Name', email: 'test@test.com', role: 'superadmin' });
        const res = await addUserAction({ request: req });
        expect(res).toHaveProperty('error', expect.stringContaining('valid role'));
    });

    it('should return error for weak password', async () => {
        const req = createRequest({ 
            name: 'Valid Name', email: 'test@test.com', role: 'user',
            password: '123' 
        });
        const res = await addUserAction({ request: req });
        // passwordIssue returns string if issue found
        expect(res).toHaveProperty('error'); 
    });

    it('should return error if region missing', async () => {
         const req = createRequest({ 
            name: 'Valid Name', email: 'test@test.com', role: 'user',
            password: 'Password123!', region: ''
        });
        const res = await addUserAction({ request: req });
        expect(res).toHaveProperty('error', 'Region is required.');
    });

    it('should call API and redirect on success', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ ok: true, user: { id: 'u1' } } as any);
        
        const req = createRequest({ 
            name: 'Valid Name', email: 'test@test.com', role: 'user',
            password: 'Password123!', region: 'Jakarta'
        });
        const res = await addUserAction({ request: req });
        
        expect(api.createUser).toHaveBeenCalledWith({
            name: 'Valid Name',
            email: 'test@test.com',
            role: 'user',
            password: 'Password123!',
            region: 'Jakarta'
        });
        expect(router.redirect).toHaveBeenCalledWith('/admin');
    });

    it('should return API error', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ ok: false, error: 'Taken' } as any);
        
        const req = createRequest({ 
            name: 'Valid Name', email: 'test@test.com', role: 'user',
            password: 'Password123!', region: 'Jakarta'
        });
        const res = await addUserAction({ request: req });
        expect(res).toHaveProperty('error', 'Taken');
    });
});
