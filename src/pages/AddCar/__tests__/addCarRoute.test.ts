import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCarRequest } from '../addCarRoute';
import * as storage from '../addCarStorage';

vi.mock('../addCarStorage', () => ({
    persistActiveCarId: vi.fn(),
}));

// Connector validation is handled by the form via zodResolver(carFormSchema)
// before createCarRequest runs.
describe('createCarRequest', () => {
    const base = {
        userId: 'user123',
        email: 'test@test.com',
        name: 'My Tesla',
        connectorTypes: ['Type2', 'CCS2'] as any,
        minKW: 50,
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

    it('requires an email', async () => {
        const result = await createCarRequest({ ...base, email: '' });
        expect(result).toEqual({ ok: false, error: 'Email is required.' });
    });

    it('requires a userId', async () => {
        const result = await createCarRequest({ ...base, userId: '' });
        expect(result).toEqual({ ok: false, error: 'User session is missing.' });
    });

    it('POSTs the payload, persists the active car, and returns ok', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'vehicle_123' }),
        } as Response);

        const result = await createCarRequest(base);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/vehicles/add-vehicle'),
            expect.objectContaining({ method: 'POST' })
        );
        const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
        expect(body).toEqual({
            userId: 'user123',
            email: 'test@test.com',
            name: 'My Tesla',
            connector_type: ['Type2', 'CCS2'],
            min_power: 50,
            batteryCapacity: 75,
        });
        expect(storage.persistActiveCarId).toHaveBeenCalledWith('vehicle_123');
        expect(result).toEqual({ ok: true });
    });

    it('returns the API error and does not persist', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'API Error' }),
        } as Response);

        const result = await createCarRequest(base);

        expect(result).toEqual({ ok: false, error: 'API Error' });
        expect(storage.persistActiveCarId).not.toHaveBeenCalled();
    });

    it('handles network errors', async () => {
        vi.mocked(fetch).mockRejectedValue(new TypeError('Network fail'));

        const result = await createCarRequest(base);

        expect(result).toEqual({ ok: false, error: 'Network fail' });
    });
});
