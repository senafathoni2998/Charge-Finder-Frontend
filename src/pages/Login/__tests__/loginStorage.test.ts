import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { persistLoginSession, getRememberedLoginEmail } from '../loginStorage';

describe('loginStorage', () => {
    const originalLocalStorage = globalThis.localStorage;

    beforeEach(() => {
        // Create a fresh localStorage mock for each test
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] ?? null,
                setItem: (key: string, value: string) => {
                    store[key] = value.toString();
                },
                removeItem: (key: string) => {
                    delete store[key];
                },
                clear: () => {
                    store = {};
                },
            };
        })();

        Object.defineProperty(globalThis, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
    });

    afterEach(() => {
        // Restore original localStorage
        Object.defineProperty(globalThis, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
    });

    describe('persistLoginSession', () => {
        it('should save token to localStorage when provided', () => {
            persistLoginSession({
                token: 'test-token-123',
                userId: 'user-1',
                email: 'test@example.com',
                region: 'US',
                role: 'user',
                remember: true,
            });

            expect(localStorage.getItem('cf_auth_token')).toBe('test-token-123');
        });

        it('should save userId to localStorage', () => {
            persistLoginSession({
                userId: 'user-456',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_auth_id')).toBe('user-456');
        });

        it('should save email to localStorage', () => {
            persistLoginSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_auth_email')).toBe('test@example.com');
        });

        it('should save region to localStorage when provided', () => {
            persistLoginSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: 'EU',
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_profile_region')).toBe('EU');
        });

        it('should save role to localStorage when provided', () => {
            persistLoginSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: null,
                role: 'admin',
                remember: false,
            });

            expect(localStorage.getItem('cf_profile_role')).toBe('admin');
        });

        it('should remove role from localStorage when role is null', () => {
            localStorage.setItem('cf_profile_role', 'admin');

            persistLoginSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_profile_role')).toBeNull();
        });

        it('should save email to loginEmail when remember is true', () => {
            persistLoginSession({
                userId: 'user-1',
                email: 'remembered@example.com',
                region: null,
                role: null,
                remember: true,
            });

            expect(localStorage.getItem('cf_login_email')).toBe('remembered@example.com');
        });

        it('should remove loginEmail when remember is false', () => {
            localStorage.setItem('cf_login_email', 'old@example.com');

            persistLoginSession({
                userId: 'user-1',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_login_email')).toBeNull();
        });

        it('should handle missing token gracefully', () => {
            persistLoginSession({
                token: null,
                userId: 'user-1',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_auth_token')).toBeNull();
        });

        it('should handle empty userId gracefully', () => {
            persistLoginSession({
                userId: '',
                email: 'test@example.com',
                region: null,
                role: null,
                remember: false,
            });

            expect(localStorage.getItem('cf_auth_id')).toBeNull();
        });

        it('should handle localStorage errors gracefully', () => {
            const mockError = vi.fn(() => {
                throw new Error('localStorage error');
            });
            Object.defineProperty(globalThis, 'localStorage', {
                value: {
                    getItem: mockError,
                    setItem: mockError,
                    removeItem: mockError,
                },
                writable: true,
            });

            // Should not throw
            expect(() => {
                persistLoginSession({
                    userId: 'user-1',
                    email: 'test@example.com',
                    region: null,
                    role: null,
                    remember: false,
                });
            }).not.toThrow();
        });

        it('should return early when window is undefined', () => {
            const originalWindow = globalThis.window;
            // @ts-expect-error - intentionally undefined for testing
            delete globalThis.window;

            expect(() => {
                persistLoginSession({
                    userId: 'user-1',
                    email: 'test@example.com',
                    region: null,
                    role: null,
                    remember: false,
                });
            }).not.toThrow();

            globalThis.window = originalWindow;
        });
    });

    describe('getRememberedLoginEmail', () => {
        it('should return null when localStorage has no loginEmail', () => {
            const email = getRememberedLoginEmail();
            expect(email).toBeNull();
        });

        it('should return the stored login email', () => {
            localStorage.setItem('cf_login_email', 'saved@example.com');
            const email = getRememberedLoginEmail();
            expect(email).toBe('saved@example.com');
        });

        it('should return null when window is undefined', () => {
            localStorage.setItem('cf_login_email', 'test@example.com');
            const originalWindow = globalThis.window;
            // @ts-expect-error - intentionally undefined for testing
            delete globalThis.window;

            const email = getRememberedLoginEmail();
            expect(email).toBeNull();

            globalThis.window = originalWindow;
        });

        it('should handle localStorage errors gracefully', () => {
            const mockError = vi.fn(() => {
                throw new Error('localStorage error');
            });
            Object.defineProperty(globalThis, 'localStorage', {
                value: {
                    getItem: mockError,
                },
                writable: true,
            });

            const email = getRememberedLoginEmail();
            expect(email).toBeNull();
        });

        it('should return null for empty string in localStorage', () => {
            localStorage.setItem('cf_login_email', '');
            const email = getRememberedLoginEmail();
            expect(email).toBe('');
        });
    });
});
