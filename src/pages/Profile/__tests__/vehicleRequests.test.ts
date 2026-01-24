import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteVehicleRequest, setActiveVehicleRequest } from '../vehicleRequests';

describe('vehicleRequests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set environment variable
        import.meta.env.VITE_APP_BACKEND_URL = 'https://api.test.com';
    });

    describe('deleteVehicleRequest', () => {
        it('should delete a vehicle successfully', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ message: 'Vehicle deleted' }),
                })
            ) as any;

            const result = await deleteVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should handle missing backend URL', async () => {
            import.meta.env.VITE_APP_BACKEND_URL = '';

            const result = await deleteVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Backend URL is not configured.');
        });

        it('should handle missing vehicle ID', async () => {
            const result = await deleteVehicleRequest({ vehicleId: '', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Vehicle is missing.');
        });

        it('should handle API error response', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 404,
                    json: () => Promise.resolve({ message: 'Vehicle not found' }),
                })
            ) as any;

            const result = await deleteVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Vehicle not found');
        });

        it('should handle network errors', async () => {
            global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

            const result = await deleteVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Network error');
        });

        it('should send correct payload to API', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await deleteVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles/delete-vehicle',
                expect.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify({ vehicleId: 'car-123', userId: 'user-456' }),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
            );
        });

        it('should handle missing userId', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await deleteVehicleRequest({ vehicleId: 'car-123' });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles/delete-vehicle',
                expect.objectContaining({
                    body: JSON.stringify({ vehicleId: 'car-123' }),
                })
            );
        });

        it('should trim userId when provided', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await deleteVehicleRequest({ vehicleId: 'car-123', userId: '  user-456  ' });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles/delete-vehicle',
                expect.objectContaining({
                    body: JSON.stringify({ vehicleId: 'car-123', userId: 'user-456' }),
                })
            );
        });
    });

    describe('setActiveVehicleRequest', () => {
        it('should set a vehicle active successfully', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ message: 'Vehicle set as active' }),
                })
            ) as any;

            const result = await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should handle missing backend URL', async () => {
            import.meta.env.VITE_APP_BACKEND_URL = '';

            const result = await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Backend URL is not configured.');
        });

        it('should handle missing vehicle ID', async () => {
            const result = await setActiveVehicleRequest({ vehicleId: '', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Vehicle is missing.');
        });

        it('should handle API error response', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 404,
                    json: () => Promise.resolve({ message: 'Vehicle not found' }),
                })
            ) as any;

            const result = await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Vehicle not found');
        });

        it('should handle network errors', async () => {
            global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

            const result = await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Network error');
        });

        it('should send correct payload to API', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456', active: true });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles/set-active-vehicle',
                expect.objectContaining({
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
            );
            const callArgs = (fetch as any).mock.calls[0];
            const bodyObj = JSON.parse(callArgs[1].body);
            expect(bodyObj).toEqual({ vehicleId: 'car-123', userId: 'user-456', active: true });
        });

        it('should default active to true when not provided', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await setActiveVehicleRequest({ vehicleId: 'car-123', userId: 'user-456' });

            const callArgs = (fetch as any).mock.calls[0];
            const bodyObj = JSON.parse(callArgs[1].body);
            expect(bodyObj).toEqual({ vehicleId: 'car-123', userId: 'user-456', active: true });
        });

        it('should handle missing userId', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                })
            ) as any;

            await setActiveVehicleRequest({ vehicleId: 'car-123' });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/vehicles/set-active-vehicle',
                expect.objectContaining({
                    body: JSON.stringify({ vehicleId: 'car-123', active: true }),
                })
            );
        });
    });
});
