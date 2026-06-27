import { describe, it, expect } from 'vitest';
import { findCarById, getCarFormDefaults } from '../utils';
import type { UserCar } from '../../features/auth/authSlice';

describe('EditCar utils', () => {
    describe('findCarById', () => {
        const mockCars: UserCar[] = [
            { id: 'car1', name: 'Tesla Model 3', connectorTypes: ['Type2', 'CCS2'], minKW: 22, batteryCapacity: 75 },
            { id: 'car2', name: 'BMW i3', connectorTypes: ['Type2'], minKW: 11, batteryCapacity: 42 },
            { id: 'car3', name: 'Audi e-tron', connectorTypes: ['CCS2', 'CHAdeMO'], minKW: 150, batteryCapacity: 95 },
        ];

        it('should return the correct car when id exists', () => {
            const result = findCarById(mockCars, 'car2');
            expect(result).toEqual(mockCars[1]);
            expect(result?.name).toBe('BMW i3');
        });

        it('should return null when car id does not exist', () => {
            const result = findCarById(mockCars, 'nonexistent');
            expect(result).toBeNull();
        });

        it('should return null when car id is null', () => {
            const result = findCarById(mockCars, null);
            expect(result).toBeNull();
        });

        it('should return null when car id is undefined', () => {
            const result = findCarById(mockCars, undefined);
            expect(result).toBeNull();
        });

        it('should return null when car id is empty string', () => {
            const result = findCarById(mockCars, '');
            expect(result).toBeNull();
        });

        it('should return null when cars array is empty', () => {
            const result = findCarById([], 'car1');
            expect(result).toBeNull();
        });
    });

    describe('getCarFormDefaults', () => {
        const mockCar: UserCar = {
            id: 'car1',
            name: 'Tesla Model 3',
            connectorTypes: ['Type2', 'CCS2'],
            minKW: 22,
            batteryCapacity: 75,
        };

        it('should return form defaults from valid car', () => {
            const result = getCarFormDefaults(mockCar);
            expect(result).toEqual({
                name: 'Tesla Model 3',
                connectorTypes: ['Type2', 'CCS2'],
                minKW: 22,
                batteryCapacity: '75',
            });
        });

        it('should return empty defaults when car is null', () => {
            const result = getCarFormDefaults(null);
            expect(result).toEqual({
                name: '',
                connectorTypes: [],
                minKW: 0,
                batteryCapacity: '',
            });
        });

        it('should handle car with no connector types', () => {
            const carNoConnectors: UserCar = {
                id: 'car1',
                name: 'Test Car',
                connectorTypes: [],
                minKW: 10,
                batteryCapacity: 50,
            };
            const result = getCarFormDefaults(carNoConnectors);
            expect(result.connectorTypes).toEqual([]);
        });

        it('should handle car with NaN minKW', () => {
            const carNaN: UserCar = {
                id: 'car1',
                name: 'Test Car',
                connectorTypes: ['Type2'],
                minKW: NaN,
                batteryCapacity: 50,
            };
            const result = getCarFormDefaults(carNaN);
            expect(result.minKW).toBe(0);
        });

        it('should handle car with null battery capacity', () => {
            const carNullBattery: UserCar = {
                id: 'car1',
                name: 'Test Car',
                connectorTypes: ['Type2'],
                minKW: 10,
                batteryCapacity: null,
            };
            const result = getCarFormDefaults(carNullBattery);
            expect(result.batteryCapacity).toBe('');
        });

        it('should handle car with undefined battery capacity', () => {
            const carUndefinedBattery: UserCar = {
                id: 'car1',
                name: 'Test Car',
                connectorTypes: ['Type2'],
                minKW: 10,
                batteryCapacity: undefined,
            };
            const result = getCarFormDefaults(carUndefinedBattery);
            expect(result.batteryCapacity).toBe('');
        });

        it('should handle car with NaN battery capacity', () => {
            const carNaNBattery: UserCar = {
                id: 'car1',
                name: 'Test Car',
                connectorTypes: ['Type2'],
                minKW: 10,
                batteryCapacity: NaN,
            };
            const result = getCarFormDefaults(carNaNBattery);
            expect(result.batteryCapacity).toBe('');
        });
    });
});
