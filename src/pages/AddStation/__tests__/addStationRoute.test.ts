import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStationRequest } from '../addStationRoute';
import * as api from '../../../api/adminStations';
import type { StationFormValues } from '../../../forms/schemas';

vi.mock('../../../api/adminStations');

const values: StationFormValues = {
    name: 'Test Station',
    address: '123 Test St',
    status: 'AVAILABLE',
    lat: '10',
    lng: '20',
    connectors: [
        { id: 'c1', type: 'CCS2', powerKW: '50', ports: '2', availablePorts: '1' },
    ],
    pricing: { currency: 'USD', perKwh: '0.3', perMinute: '', parkingFee: '' },
    amenities: '',
    photos: [],
    notes: '',
};

describe('createStationRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('builds the payload and calls createStation', async () => {
        vi.mocked(api.createStation).mockResolvedValue({
            ok: true,
            station: { id: 's1' },
        } as any);

        const result = await createStationRequest(values);

        expect(result).toEqual({ ok: true });
        expect(api.createStation).toHaveBeenCalledTimes(1);
        const payload = vi.mocked(api.createStation).mock.calls[0][0];
        expect(payload).toMatchObject({
            name: 'Test Station',
            lat: 10,
            lng: 20,
            connectors: [{ type: 'CCS2', powerKW: 50, ports: 2, availablePorts: 1 }],
        });
    });

    it('returns the error on API failure', async () => {
        vi.mocked(api.createStation).mockResolvedValue({
            ok: false,
            error: 'API Error',
        } as any);

        expect(await createStationRequest(values)).toEqual({
            ok: false,
            error: 'API Error',
        });
    });

    it('falls back to a default error message', async () => {
        vi.mocked(api.createStation).mockResolvedValue({ ok: false } as any);

        expect(await createStationRequest(values)).toEqual({
            ok: false,
            error: 'Could not create station.',
        });
    });
});
