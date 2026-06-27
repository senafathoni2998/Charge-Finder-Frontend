import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStationRequest } from '../editStationRoute';
import * as api from '../../../api/adminStations';
import type { StationFormValues } from '../../../forms/schemas';

vi.mock('../../../api/adminStations', () => ({ updateStation: vi.fn() }));

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

describe('updateStationRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an error when stationId is missing', async () => {
        const result = await updateStationRequest('', values);
        expect(result).toEqual({ ok: false, error: 'Station ID is missing.' });
        expect(api.updateStation).not.toHaveBeenCalled();
    });

    it('calls updateStation with the built payload', async () => {
        vi.mocked(api.updateStation).mockResolvedValue({ ok: true } as any);

        const result = await updateStationRequest('s1', values);

        expect(result).toEqual({ ok: true });
        expect(api.updateStation).toHaveBeenCalledTimes(1);
        const [id, payload] = vi.mocked(api.updateStation).mock.calls[0];
        expect(id).toBe('s1');
        expect(payload).toMatchObject({ name: 'Test Station', lat: 10, lng: 20 });
    });

    it('returns the error when updateStation fails', async () => {
        vi.mocked(api.updateStation).mockResolvedValue({
            ok: false,
            error: 'Update failed',
        } as any);

        expect(await updateStationRequest('s1', values)).toEqual({
            ok: false,
            error: 'Update failed',
        });
    });
});
