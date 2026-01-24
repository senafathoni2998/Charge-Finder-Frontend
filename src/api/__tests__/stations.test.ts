import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchStations, fetchStationById } from '../stations';

describe('stations API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('fetchStations', () => {
    it('should fetch stations successfully without params', async () => {
      const mockStations = [{ id: '1', name: 'Station 1' }];
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stations: mockStations }),
      });

      const result = await fetchStations();
      expect(result).toEqual({ ok: true, stations: mockStations });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations`, expect.objectContaining({ method: 'GET' }));
    });

    it('should fetch stations with params', async () => {
      const params = { lat: 10, lng: 20, radiusKm: 5 };
      const mockStations = [{ id: '1', name: 'Station 1' }];
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stations: mockStations }),
      });

      const result = await fetchStations(params);
      expect(result).toEqual({ ok: true, stations: mockStations });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`lat=10&lng=20&radiusKm=5`),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('fetchStationById', () => {
    const stationId = '123';

    it('should return error if stationId is missing', async () => {
      const result = await fetchStationById('');
      expect(result).toEqual({ ok: false, station: null, error: "Station ID is missing." });
    });

    it('should fetch station successfully', async () => {
      const mockStation = { id: stationId, name: 'Station 1' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: mockStation }),
      });

      const result = await fetchStationById(stationId);
      expect(result).toEqual({ ok: true, station: mockStation });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/${stationId}`, expect.objectContaining({ method: 'GET' }));
    });

    it('should handle station not found (null)', async () => {
        (global.fetch as any).mockResolvedValue({
          ok: true,
          json: async () => null,
        });
  
        const result = await fetchStationById(stationId);
        expect(result).toEqual({ ok: false, station: null, error: "Station not found." });
      });
  });
});
