import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addStationAction } from '../addStationRoute';
import * as router from 'react-router';
import * as utils from '../stationFormUtils';
import * as api from '../../../api/adminStations';

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        redirect: vi.fn((path) => ({ type: 'redirect', path })),
    };
});

vi.mock('../stationFormUtils');
vi.mock('../../../api/adminStations');

describe('addStationRoute', () => {
    const createRequest = () => ({
        formData: async () => new FormData(),
    } as unknown as Request);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it('should return error if parsing fails', async () => {
        vi.mocked(utils.parseStationFormData).mockReturnValue({ ok: false, error: 'Parse Error' });
        
        const response = await addStationAction({ request: createRequest() });
        expect(response).toHaveProperty('error', 'Parse Error');
    });

    it('should return error if API call fails', async () => {
        vi.mocked(utils.parseStationFormData).mockReturnValue({ 
            ok: true, 
            payload: {} as any 
        });
        vi.mocked(api.createStation).mockResolvedValue({ ok: false, error: 'API Error' } as any);

        const response = await addStationAction({ request: createRequest() });
        expect(response).toHaveProperty('error', 'API Error');
    });

    it('should redirect on success', async () => {
        vi.mocked(utils.parseStationFormData).mockReturnValue({ 
            ok: true, 
            payload: {} as any 
        });
        vi.mocked(api.createStation).mockResolvedValue({ ok: true, station: { id: 's1' } } as any);

        const response = await addStationAction({ request: createRequest() });
        expect(router.redirect).toHaveBeenCalledWith('/admin');
        expect(response).toHaveProperty('path', '/admin');
    });
});
