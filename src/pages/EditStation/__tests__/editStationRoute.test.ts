import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStationRequest } from '../editStationRoute';
import * as api from '../../../api/adminStations';
import type { StationFormValues } from '../../../forms/schemas';

vi.mock('../../../api/adminStations', () => ({ updateStation: vi.fn() }));

// Fake translator: returns the English strings for the module's own keys so the
// exact-message assertions stay valid; other keys fall through to the key.
const t = ((key: string) => {
    const map: Record<string, string> = {
        'errors.missingId': 'Station ID is missing.',
        'errors.updateFailed': 'Could not update station.',
    };
    return map[key] ?? key;
}) as any;

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

const noImage = { file: null, remove: false };

describe('updateStationRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an error when stationId is missing', async () => {
        const result = await updateStationRequest('', values, noImage, t);
        expect(result).toEqual({ ok: false, error: 'Station ID is missing.' });
        expect(api.updateStation).not.toHaveBeenCalled();
    });

    it('calls updateStation with the built payload and image options', async () => {
        vi.mocked(api.updateStation).mockResolvedValue({ ok: true } as any);

        const result = await updateStationRequest('s1', values, noImage, t);

        expect(result).toEqual({ ok: true });
        expect(api.updateStation).toHaveBeenCalledTimes(1);
        const [id, payload, options] = vi.mocked(api.updateStation).mock.calls[0];
        expect(id).toBe('s1');
        expect(payload).toMatchObject({ name: 'Test Station', lat: 10, lng: 20 });
        expect(options).toEqual({ image: null, removeFeaturedImage: false });
    });

    it('forwards a picked image + removal flag to updateStation', async () => {
        vi.mocked(api.updateStation).mockResolvedValue({ ok: true } as any);
        const file = new File(['x'], 'hero.png', { type: 'image/png' });

        await updateStationRequest('s1', values, { file, remove: false }, t);

        const [, , options] = vi.mocked(api.updateStation).mock.calls[0];
        expect(options).toEqual({ image: file, removeFeaturedImage: false });
    });

    it('returns the error when updateStation fails', async () => {
        vi.mocked(api.updateStation).mockResolvedValue({
            ok: false,
            error: 'Update failed',
        } as any);

        expect(await updateStationRequest('s1', values, noImage, t)).toEqual({
            ok: false,
            error: 'Update failed',
        });
    });
});
