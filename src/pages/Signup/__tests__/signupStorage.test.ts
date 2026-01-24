import { describe, it, expect, beforeEach, vi } from 'vitest';
import { persistSignupSession } from '../signupStorage';

describe('signupStorage', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should save token to localStorage when provided', () => {
        persistSignupSession({
            token: 'test-token-123',
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: true,
        });

        expect(localStorage.getItem('cf_auth_token')).toBe('test-token-123');
    });

    it('should save userId to localStorage', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: true,
        });

        expect(localStorage.getItem('cf_auth_id')).toBe('user-1');
    });

    it('should save email to localStorage', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: true,
        });

        expect(localStorage.getItem('cf_auth_email')).toBe('test@example.com');
    });

    it('should save region to localStorage when provided', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: true,
        });

        expect(localStorage.getItem('cf_profile_region')).toBe('Jakarta');
    });

    it('should not save region to localStorage when not provided', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: null,
            remember: true,
        });

        expect(localStorage.getItem('cf_profile_region')).toBeNull();
    });

    it('should save role to localStorage when provided', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            role: 'admin',
            remember: true,
        });

        expect(localStorage.getItem('cf_profile_role')).toBe('admin');
    });

    it('should remove role from localStorage when role is null', () => {
        localStorage.setItem('cf_profile_role', 'admin');

        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            role: null,
            remember: true,
        });

        expect(localStorage.getItem('cf_profile_role')).toBeNull();
    });

    it('should save login email to localStorage when remember is true', () => {
        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: true,
        });

        expect(localStorage.getItem('cf_login_email')).toBe('test@example.com');
    });

    it('should remove login email from localStorage when remember is false', () => {
        localStorage.setItem('cf_login_email', 'old@example.com');

        persistSignupSession({
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            remember: false,
        });

        expect(localStorage.getItem('cf_login_email')).toBeNull();
    });

    it('should handle window being undefined gracefully', () => {
        const originalWindow = globalThis.window;
        delete (globalThis as any).window;

        expect(() => {
            persistSignupSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: 'Jakarta',
                remember: true,
            });
        }).not.toThrow();

        (globalThis as any).window = originalWindow;
    });

    it('should handle localStorage errors gracefully', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = vi.fn(() => {
            throw new Error('Storage quota exceeded');
        });

        expect(() => {
            persistSignupSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: 'Jakarta',
                remember: true,
            });
        }).not.toThrow();

        localStorage.setItem = originalSetItem;
    });

    it('should save all required fields to localStorage', () => {
        persistSignupSession({
            token: 'token-123',
            userId: 'user-1',
            email: 'test@example.com',
            region: 'Jakarta',
            role: 'user',
            remember: true,
        });

        expect(localStorage.getItem('cf_auth_token')).toBe('token-123');
        expect(localStorage.getItem('cf_auth_id')).toBe('user-1');
        expect(localStorage.getItem('cf_auth_email')).toBe('test@example.com');
        expect(localStorage.getItem('cf_profile_region')).toBe('Jakarta');
        expect(localStorage.getItem('cf_profile_role')).toBe('user');
        expect(localStorage.getItem('cf_login_email')).toBe('test@example.com');
    });
});
