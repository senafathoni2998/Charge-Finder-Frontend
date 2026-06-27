import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { editCarRequest } from '../editCarRoute';

// Connector validation is handled by the form via zodResolver(carFormSchema)
// before editCarRequest runs.
describe('editCarRequest', () => {
    const base = {
        vehicleId: 'car1',
        userId: 'user1',
        name: 'My Tesla',
        connectorTypes: ['Type2', 'CCS2'] as any,
        minKW: 22,
        batteryCapacity: '75',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('VITE_APP_BACKEND_URL', 'http://localhost:8000');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('requires a vehicleId', async () => {
        const result = await editCarRequest({ ...base, vehicleId: '' });
        expect(result).toEqual({ ok: false, error: 'Vehicle is missing.' });
    });

    it('requires a userId', async () => {
        const result = await editCarRequest({ ...base, userId: '' });
        expect(result).toEqual({ ok: false, error: 'User session is missing.' });
    });

    it('PATCHes the payload and returns ok', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);

        const result = await editCarRequest(base);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/vehicles/update-vehicle'),
            expect.objectContaining({ method: 'PATCH' })
        );
        const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
        expect(body).toEqual({
            vehicleId: 'car1',
            userId: 'user1',
            name: 'My Tesla',
            connector_type: ['Type2', 'CCS2'],
            min_power: 22,
            batteryCapacity: 75,
        });
        expect(result).toEqual({ ok: true });
    });

    it('defaults the name and omits an empty battery capacity', async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);

        await editCarRequest({ ...base, name: '', batteryCapacity: '' });

        const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
        expect(body.name).toBe('My EV');
        expect(body).not.toHaveProperty('batteryCapacity');
    });

    it('returns the API error', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Update failed' }),
        } as Response);

        const result = await editCarRequest(base);

        expect(result).toEqual({ ok: false, error: 'Update failed' });
    });

    it('handles network errors', async () => {
        vi.mocked(fetch).mockRejectedValue(new TypeError('Network fail'));

        const result = await editCarRequest(base);

        expect(result).toEqual({ ok: false, error: 'Network fail' });
    });
});
