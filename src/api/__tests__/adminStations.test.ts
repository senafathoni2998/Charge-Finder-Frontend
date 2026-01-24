import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStation, updateStation, deleteStation } from '../adminStations';

describe('adminStations API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('createStation', () => {
    const validPayload: any = {
      name: 'Test Station',
      latitude: 10,
      longitude: 20,
      connectors: [],
    };

    it('should return error if backend URL is not configured', async () => {
      vi.stubEnv('VITE_APP_BACKEND_URL', '');
      const result = await createStation(validPayload);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: "Backend URL is not configured.",
      });
    });

    it('should create a station successfully', async () => {
      const mockStation = { id: '123', ...validPayload };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: mockStation }),
      });

      const result = await createStation(validPayload);
      expect(result).toEqual({ ok: true, station: mockStation });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/add-station`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validPayload),
      }));
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Validation failed' }),
      });

      const result = await createStation(validPayload);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'Validation failed',
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await createStation(validPayload);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'Network error',
      });
    });
  });

  describe('updateStation', () => {
    const stationId = '123';
    const updatePayload = { name: 'Updated Station' };

    it('should return error if backend URL is not configured', async () => {
      vi.stubEnv('VITE_APP_BACKEND_URL', '');
      const result = await updateStation(stationId, updatePayload as any);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: "Backend URL is not configured.",
      });
    });

    it('should return error if stationId is missing', async () => {
      const result = await updateStation('', updatePayload as any);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: "Station ID is missing.",
      });
    });

    it('should update a station successfully', async () => {
      const mockStation = { id: stationId, ...updatePayload };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: mockStation }),
      });

      const result = await updateStation(stationId, updatePayload as any);
      expect(result).toEqual({ ok: true, station: mockStation });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/update-station`, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ ...updatePayload, stationId }),
      }));
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Update failed' }),
      });

      const result = await updateStation(stationId, updatePayload as any);
      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'Update failed',
      });
    });
  });

  describe('deleteStation', () => {
    const stationId = '123';

    it('should return error if backend URL is not configured', async () => {
      vi.stubEnv('VITE_APP_BACKEND_URL', '');
      const result = await deleteStation(stationId);
      expect(result).toEqual({
        ok: false,
        error: "Backend URL is not configured.",
      });
    });

    it('should return error if stationId is missing', async () => {
      const result = await deleteStation('');
      expect(result).toEqual({
        ok: false,
        error: "Station ID is missing.",
      });
    });

    it('should delete a station successfully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await deleteStation(stationId);
      expect(result).toEqual({ ok: true });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/delete-station`, expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ stationId }),
      }));
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Deletion failed' }),
      });

      const result = await deleteStation(stationId);
      expect(result).toEqual({
        ok: false,
        error: 'Deletion failed',
      });
    });
  });
});
