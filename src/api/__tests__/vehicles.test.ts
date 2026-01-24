import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchVehicleById } from '../vehicles';

describe('vehicles API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('fetchVehicleById', () => {
    const vehicleId = 'vehicle-123';

    it('should return error if vehicleId is missing', async () => {
      const result = await fetchVehicleById('');
      expect(result).toEqual({ ok: false, vehicle: null, error: "Vehicle is missing." });
    });

    it('should fetch vehicle successfully', async () => {
      const mockVehicle = { id: vehicleId, model: 'Tesla' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ vehicle: mockVehicle }),
      });

      const result = await fetchVehicleById(vehicleId);
      expect(result).toEqual({ ok: true, vehicle: mockVehicle });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/vehicles/${vehicleId}`, expect.objectContaining({ method: 'GET' }));
    });

    it('should handle vehicle not found', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => null,
        });

        const result = await fetchVehicleById(vehicleId);
        expect(result).toEqual({ ok: false, vehicle: null, error: "Vehicle not found." });
    });
  });
});
