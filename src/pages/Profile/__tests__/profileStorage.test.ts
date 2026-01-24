import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    readStoredAuthToken,
    readStoredActiveCarId,
    readStoredUserId,
    persistProfileToStorage,
    persistCarsToStorage,
    clearAuthStorage,
} from '../profileStorage';
import type { UserCar } from '../../../features/auth/authSlice';

describe('profileStorage', () => {
    const originalLocalStorage = globalThis.localStorage;
    const originalSessionStorage = globalThis.sessionStorage;

    beforeEach(() => {
        // Create fresh localStorage and sessionStorage mocks for each test
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

        const sessionStorageMock = (() => {
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

        Object.defineProperty(globalThis, 'sessionStorage', {
            value: sessionStorageMock,
            writable: true,
        });
    });

    afterEach(() => {
        // Restore original localStorage and sessionStorage
        Object.defineProperty(globalThis, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
        Object.defineProperty(globalThis, 'sessionStorage', {
            value: originalSessionStorage,
            writable: true,
        });
    });

    describe('readStoredAuthToken', () => {
        it('should return the stored auth token', () => {
            localStorage.setItem('cf_auth_token', 'test-token-123');
            expect(readStoredAuthToken()).toBe('test-token-123');
        });

        it('should return null when token is not stored', () => {
            expect(readStoredAuthToken()).toBeNull();
        });

        it('should return null when window is undefined', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(readStoredAuthToken()).toBeNull();

            (globalThis as any).window = originalWindow;
        });
    });

    describe('readStoredActiveCarId', () => {
        it('should return the stored active car id', () => {
            localStorage.setItem('cf_active_car_id', 'car-456');
            expect(readStoredActiveCarId()).toBe('car-456');
        });

        it('should return null when active car id is not stored', () => {
            expect(readStoredActiveCarId()).toBeNull();
        });
    });

    describe('readStoredUserId', () => {
        it('should return the stored user id', () => {
            localStorage.setItem('cf_auth_id', 'user-789');
            expect(readStoredUserId()).toBe('user-789');
        });

        it('should return null when user id is not stored', () => {
            expect(readStoredUserId()).toBeNull();
        });
    });

    describe('persistProfileToStorage', () => {
        it('should save name and region to localStorage', () => {
            persistProfileToStorage('John Doe', 'Jakarta, ID');

            expect(localStorage.getItem('cf_profile_name')).toBe('John Doe');
            expect(localStorage.getItem('cf_profile_region')).toBe('Jakarta, ID');
        });

        it('should save role when provided', () => {
            persistProfileToStorage('John Doe', 'Jakarta, ID', 'admin');

            expect(localStorage.getItem('cf_profile_role')).toBe('admin');
        });

        it('should remove role when role is null', () => {
            localStorage.setItem('cf_profile_role', 'admin');
            persistProfileToStorage('John Doe', 'Jakarta, ID', null);

            expect(localStorage.getItem('cf_profile_role')).toBeNull();
        });

        it('should remove name when name is null', () => {
            localStorage.setItem('cf_profile_name', 'John Doe');
            persistProfileToStorage(null, 'Jakarta, ID');

            expect(localStorage.getItem('cf_profile_name')).toBeNull();
        });

        it('should remove region when region is null', () => {
            localStorage.setItem('cf_profile_region', 'Jakarta, ID');
            persistProfileToStorage('John Doe', null);

            expect(localStorage.getItem('cf_profile_region')).toBeNull();
        });

        it('should handle missing role parameter', () => {
            persistProfileToStorage('John Doe', 'Jakarta, ID');

            expect(localStorage.getItem('cf_profile_name')).toBe('John Doe');
            expect(localStorage.getItem('cf_profile_region')).toBe('Jakarta, ID');
            expect(localStorage.getItem('cf_profile_role')).toBeNull();
        });

        it('should return early when window is undefined', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(() => {
                persistProfileToStorage('Test', 'Region');
            }).not.toThrow();

            (globalThis as any).window = originalWindow;
        });
    });

    describe('persistCarsToStorage', () => {
        const mockCars: UserCar[] = [
            { id: 'car-1', name: 'Tesla Model 3', connectorTypes: ['CCS2'], minKW: 50, batteryCapacity: 75 },
            { id: 'car-2', name: 'Nissan Leaf', connectorTypes: ['CHAdeMO'], minKW: 30, batteryCapacity: 40 },
        ];

        it('should save cars and active car id to localStorage', () => {
            persistCarsToStorage(mockCars, 'car-1');

            expect(localStorage.getItem('cf_user_cars')).toBe(JSON.stringify(mockCars));
            expect(localStorage.getItem('cf_active_car_id')).toBe('car-1');
        });

        it('should remove active car id when null is provided', () => {
            localStorage.setItem('cf_active_car_id', 'car-1');
            persistCarsToStorage(mockCars, null);

            expect(localStorage.getItem('cf_active_car_id')).toBeNull();
        });

        it('should remove legacy user car key', () => {
            localStorage.setItem('cf_user_car', 'legacy-data');
            persistCarsToStorage(mockCars, 'car-1');

            expect(localStorage.getItem('cf_user_car')).toBeNull();
        });

        it('should handle empty cars array', () => {
            persistCarsToStorage([], 'car-1');

            expect(localStorage.getItem('cf_user_cars')).toBe('[]');
        });

        it('should return early when window is undefined', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(() => {
                persistCarsToStorage(mockCars, 'car-1');
            }).not.toThrow();

            (globalThis as any).window = originalWindow;
        });
    });

    describe('clearAuthStorage', () => {
        beforeEach(() => {
            localStorage.setItem('cf_auth_token', 'token');
            localStorage.setItem('cf_auth_email', 'test@example.com');
            localStorage.setItem('cf_profile_name', 'John');
            localStorage.setItem('cf_profile_region', 'Jakarta');
            localStorage.setItem('cf_profile_role', 'user');
            localStorage.setItem('cf_user_car', 'car-data');
            localStorage.setItem('cf_user_cars', 'cars-data');
            localStorage.setItem('cf_active_car_id', 'car-1');
        });

        it('should remove all auth-related items from localStorage', () => {
            clearAuthStorage();

            expect(localStorage.getItem('cf_auth_token')).toBeNull();
            expect(localStorage.getItem('cf_auth_email')).toBeNull();
            expect(localStorage.getItem('cf_profile_name')).toBeNull();
            expect(localStorage.getItem('cf_profile_region')).toBeNull();
            expect(localStorage.getItem('cf_profile_role')).toBeNull();
            expect(localStorage.getItem('cf_user_car')).toBeNull();
            expect(localStorage.getItem('cf_user_cars')).toBeNull();
            expect(localStorage.getItem('cf_active_car_id')).toBeNull();
        });

        it('should set logout redirect in sessionStorage when flag is true', () => {
            clearAuthStorage({ setLogoutRedirect: true });

            expect(sessionStorage.getItem('cf_logout_redirect')).toBe('1');
        });

        it('should not set logout redirect in sessionStorage when flag is false', () => {
            clearAuthStorage({ setLogoutRedirect: false });

            expect(sessionStorage.getItem('cf_logout_redirect')).toBeNull();
        });

        it('should set logout redirect by default', () => {
            clearAuthStorage();

            expect(sessionStorage.getItem('cf_logout_redirect')).toBe('1');
        });

        it('should return early when window is undefined', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(() => {
                clearAuthStorage();
            }).not.toThrow();

            (globalThis as any).window = originalWindow;
        });
    });
});
