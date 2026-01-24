import { describe, it, expect, vi, beforeEach } from 'vitest';
import { editStationAction } from '../editStationRoute';
import * as adminStations from '../../../api/adminStations';
import { parseStationFormData } from '../../AddStation/stationFormUtils';

// Mock the API and utils
vi.mock('../../../api/adminStations', () => ({
    updateStation: vi.fn(),
}));

vi.mock('../../AddStation/stationFormUtils', () => ({
    parseStationFormData: vi.fn(),
}));

describe('editStationRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error when stationId is missing', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Station');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editStationAction({ request });
        expect(result).toEqual({ error: 'Station ID is missing.' });
    });

    it('should return error from parseStationFormData', async () => {
        vi.mocked(parseStationFormData).mockReturnValue({
            ok: false,
            error: 'Validation failed',
        } as any);

        const formData = new FormData();
        formData.append('stationId', 's1');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editStationAction({ request });
        expect(result).toEqual({ error: 'Validation failed' });
    });

    it('should call updateStation with correct payload', async () => {
        vi.mocked(adminStations.updateStation).mockResolvedValue({ ok: true } as any);
        vi.mocked(parseStationFormData).mockReturnValue({
            ok: true,
            payload: { name: 'Updated Station' },
        } as any);

        const formData = new FormData();
        formData.append('stationId', 's1');
        formData.append('name', 'Test Station');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        await editStationAction({ request });

        expect(adminStations.updateStation).toHaveBeenCalledWith('s1', { name: 'Updated Station' });
    });

    it('should return error when updateStation fails', async () => {
        vi.mocked(adminStations.updateStation).mockResolvedValue({
            ok: false,
            error: 'Update failed',
        } as any);
        vi.mocked(parseStationFormData).mockReturnValue({
            ok: true,
            payload: { name: 'Test' },
        } as any);

        const formData = new FormData();
        formData.append('stationId', 's1');

        const request = new Request('http://localhost:3000', {
            method: 'POST',
            body: formData,
        });

        const result = await editStationAction({ request });
        expect(result).toEqual({ error: 'Update failed' });
    });
});
