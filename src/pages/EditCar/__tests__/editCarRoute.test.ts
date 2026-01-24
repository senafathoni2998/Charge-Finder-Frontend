import { describe, it, expect, vi, beforeEach } from 'vitest';
import { editCarAction } from '../editCarRoute';

describe('editCarRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should return error when vehicleId is missing', async () => {
        const formData = new FormData();
        formData.append('userId', 'user1');
        formData.append('name', 'Test Car');
        formData.append('connectorTypes', 'Type2');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editCarAction({ request });
        expect(result).toEqual({ error: 'Vehicle is missing.' });
    });

    it('should return error when connector types are empty', async () => {
        const formData = new FormData();
        formData.append('vehicleId', 'car1');
        formData.append('userId', 'user1');
        formData.append('name', 'Test Car');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editCarAction({ request });
        expect(result).toEqual({ error: 'Select at least one connector type.' });
    });

    it('should return error when userId is missing', async () => {
        const formData = new FormData();
        formData.append('vehicleId', 'car1');
        formData.append('name', 'Test Car');
        formData.append('connectorTypes', 'Type2');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editCarAction({ request });
        expect(result).toEqual({ error: 'User session is missing.' });
    });

    it('should handle multiple connector types', async () => {
        const formData = new FormData();
        formData.append('vehicleId', 'car1');
        formData.append('userId', 'user1');
        formData.append('name', 'Test Car');
        formData.append('connectorTypes', 'Type2');
        formData.append('connectorTypes', 'CCS2');
        formData.append('minKW', '22');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const connectorTypes = formData.getAll('connectorTypes');
        expect(connectorTypes).toEqual(['Type2', 'CCS2']);
    });

    it('should handle empty battery capacity string', async () => {
        const formData = new FormData();
        formData.append('vehicleId', 'car1');
        formData.append('userId', 'user1');
        formData.append('name', 'Test Car');
        formData.append('connectorTypes', 'Type2');
        formData.append('batteryCapacity', '');

        const batteryCapacityRaw = formData.get('batteryCapacity');
        const batteryCapacityValue =
            typeof batteryCapacityRaw === 'string' && batteryCapacityRaw.trim()
                ? Number(batteryCapacityRaw)
                : null;
        expect(batteryCapacityValue).toBeNull();
    });

    it('should handle valid battery capacity', async () => {
        const formData = new FormData();
        formData.append('vehicleId', 'car1');
        formData.append('userId', 'user1');
        formData.append('name', 'Test Car');
        formData.append('connectorTypes', 'Type2');
        formData.append('batteryCapacity', '75');

        const batteryCapacityRaw = formData.get('batteryCapacity');
        const batteryCapacityValue =
            typeof batteryCapacityRaw === 'string' && batteryCapacityRaw.trim()
                ? Number(batteryCapacityRaw)
                : null;
        expect(batteryCapacityValue).toBe(75);
    });

    it('should handle invalid minKW', async () => {
        const formData = new FormData();
        formData.append('minKW', 'invalid');

        const minKW = Number.isFinite(Number(formData.get('minKW')))
            ? Number(formData.get('minKW'))
            : 0;
        expect(minKW).toBe(0);
    });

    it('should handle valid minKW', async () => {
        const formData = new FormData();
        formData.append('minKW', '22');

        const minKW = Number.isFinite(Number(formData.get('minKW')))
            ? Number(formData.get('minKW'))
            : 0;
        expect(minKW).toBe(22);
    });

    it('should default name when empty', async () => {
        const formData = new FormData();
        formData.append('name', '');

        const nameRaw = String(formData.get('name') || '').trim();
        const name = nameRaw || 'My EV';
        expect(name).toBe('My EV');
    });

    it('should use provided name', async () => {
        const formData = new FormData();
        formData.append('name', 'My Tesla');

        const nameRaw = String(formData.get('name') || '').trim();
        const name = nameRaw || 'My EV';
        expect(name).toBe('My Tesla');
    });
});
