import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    persistActiveCarId,
    hasSeenDemoHint,
    markDemoHintSeen,
} from '../mainPageStorage';

describe('mainPageStorage', () => {
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

    describe('persistActiveCarId', () => {
        it('should save carId to localStorage when provided', () => {
            persistActiveCarId('car-123');
            expect(localStorage.getItem('cf_active_car_id')).toBe('car-123');
        });

        it('should remove carId from localStorage when null is provided', () => {
            localStorage.setItem('cf_active_car_id', 'car-123');
            persistActiveCarId(null);
            expect(localStorage.getItem('cf_active_car_id')).toBeNull();
        });

        it('should remove legacy car key when carId is provided', () => {
            localStorage.setItem('cf_user_car', 'legacy-car-data');
            persistActiveCarId('car-456');
            expect(localStorage.getItem('cf_user_car')).toBeNull();
        });

        it('should remove legacy car key when null is provided', () => {
            localStorage.setItem('cf_user_car', 'legacy-car-data');
            persistActiveCarId(null);
            expect(localStorage.getItem('cf_user_car')).toBeNull();
        });

        it('should return early when window is undefined', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(() => {
                persistActiveCarId('car-789');
            }).not.toThrow();

            (globalThis as any).window = originalWindow;
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
                persistActiveCarId('car-error');
            }).not.toThrow();
        });

        it('should update carId when new value is provided', () => {
            persistActiveCarId('car-1');
            expect(localStorage.getItem('cf_active_car_id')).toBe('car-1');

            persistActiveCarId('car-2');
            expect(localStorage.getItem('cf_active_car_id')).toBe('car-2');
        });

        it('should remove carId when empty string is provided', () => {
            localStorage.setItem('cf_active_car_id', 'car-123');
            persistActiveCarId('');
            expect(localStorage.getItem('cf_active_car_id')).toBeNull();
        });

        it('should handle special characters in carId', () => {
            const specialCarId = 'car-123_456.789';
            persistActiveCarId(specialCarId);
            expect(localStorage.getItem('cf_active_car_id')).toBe(specialCarId);
        });
    });

    describe('demo hint flag', () => {
        it('is false until marked, true afterwards', () => {
            expect(hasSeenDemoHint()).toBe(false);
            markDemoHintSeen();
            expect(hasSeenDemoHint()).toBe(true);
            expect(localStorage.getItem('cf_demo_hint_seen')).toBe('1');
        });

        it('treats a missing window as already seen (SSR-safe)', () => {
            const originalWindow = globalThis.window;
            delete (globalThis as any).window;

            expect(hasSeenDemoHint()).toBe(true);
            expect(() => markDemoHintSeen()).not.toThrow();

            (globalThis as any).window = originalWindow;
        });
    });
});
