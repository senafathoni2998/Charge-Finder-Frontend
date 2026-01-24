import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import authReducer, {
  login,
  logout,
  updateProfile,
  setCars,
  addCar,
  removeCar,
  setActiveCar,
  UserCar,
} from '../authSlice';

describe('authSlice', () => {
    const initialState = {
        isAuthenticated: false,
        email: null,
        userId: null,
        name: null,
        region: null,
        role: null,
        cars: [],
        activeCarId: null,
    };

    const mockCar: UserCar = {
        id: 'car-1',
        name: 'My Tesla',
        connectorTypes: ['CCS2'],
        minKW: 50,
        batteryCapacity: 75,
        isActive: true,
    };

    it('should handle initial state', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle login', () => {
        const payload = {
            userId: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            region: 'US',
            role: 'user',
        };
        const actual = authReducer(initialState, login(payload));
        expect(actual.isAuthenticated).toBe(true);
        expect(actual.userId).toBe(payload.userId);
        expect(actual.email).toBe(payload.email);
        expect(actual.name).toBe(payload.name);
        expect(actual.region).toBe(payload.region);
        expect(actual.role).toBe(payload.role);
    });

    it('should handle logout', () => {
        const loggedInState = {
            ...initialState,
            isAuthenticated: true,
            userId: 'user-123',
        };
        const actual = authReducer(loggedInState, logout());
        expect(actual).toEqual(initialState);
    });

    it('should handle updateProfile', () => {
        const actual = authReducer(initialState, updateProfile({ name: 'New Name', region: 'EU' }));
        expect(actual.name).toBe('New Name');
        expect(actual.region).toBe('EU');
    });

    describe('Car Management', () => {
        it('should handle addCar', () => {
            const actual = authReducer(initialState, addCar(mockCar));
            expect(actual.cars).toHaveLength(1);
            expect(actual.cars[0]).toEqual(mockCar);
            expect(actual.activeCarId).toBe(mockCar.id);
        });

        it('should handle removeCar', () => {
             const stateWithCar = { ...initialState, cars: [mockCar], activeCarId: mockCar.id };
             const actual = authReducer(stateWithCar, removeCar(mockCar.id));
             expect(actual.cars).toHaveLength(0);
             expect(actual.activeCarId).toBeNull();
        });

        it('should handle setActiveCar', () => {
             const stateWithCar = { ...initialState, cars: [mockCar], activeCarId: null };
             const actual = authReducer(stateWithCar, setActiveCar(mockCar.id));
             expect(actual.activeCarId).toBe(mockCar.id);
        });
        
        it('should handle setCars', () => {
            const cars = [mockCar, { ...mockCar, id: 'car-2' }];
            const actual = authReducer(initialState, setCars({ cars }));
            expect(actual.cars).toHaveLength(2);
            // Should default set active car to first one if none selected and present in list?
             // Logic: activeCarId = ensureActiveCarId(sanitized, requestedActive);
             // ensureActiveCarId: if (activeId && cars.some...) return activeId; return cars.length ? cars[0].id : null;
            expect(actual.activeCarId).toBe(mockCar.id);
        });
    });
});
