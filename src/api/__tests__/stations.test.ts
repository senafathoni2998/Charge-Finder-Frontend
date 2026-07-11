import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchStations, fetchStationById, fetchStationAvailability } from '../stations';

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

  describe('fetchStationAvailability', () => {
    const stationId = 'st1';
    const availability = {
      stationId,
      status: 'AVAILABLE',
      lastUpdatedISO: '2026-01-01T00:00:00.000Z',
      connectors: [{ type: 'CCS2', powerKW: 100, ports: 4, availablePorts: 2 }],
    };

    it('fetches live availability from the availability endpoint', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ availability }),
      });

      const result = await fetchStationAvailability(stationId);
      expect(result).toEqual({ ok: true, availability });
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/stations/${stationId}/availability`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('returns an error without fetching when stationId is missing', async () => {
      const result = await fetchStationAvailability('');
      expect(result.ok).toBe(false);
      expect(result.availability).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('surfaces the API error on failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'boom' }),
      });
      const result = await fetchStationAvailability(stationId);
      expect(result).toEqual({ ok: false, availability: null, error: 'boom' });
    });
  });
});
