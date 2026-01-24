import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reverseGeocode } from '../geocode';

describe('geocode API', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('reverseGeocode', () => {
    const lat = 10;
    const lng = 20;

    it('should return error for invalid coordinates', async () => {
      const result = await reverseGeocode(NaN, lng);
      expect(result).toEqual({ ok: false, address: null, error: "Invalid coordinates." });
    });

    it('should resolve address successfully', async () => {
      const mockAddress = '123 Main St';
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ display_name: mockAddress }),
      });

      const result = await reverseGeocode(lat, lng);
      expect(result).toEqual({ ok: true, address: mockAddress });
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('nominatim.openstreetmap.org'), expect.objectContaining({ method: 'GET' }));
    });

    it('should handle no address found', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ }),
        });
    
        const result = await reverseGeocode(lat, lng);
        expect(result).toEqual({ ok: false, address: null, error: "No address found." });
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Service unavailable' }),
      });

      const result = await reverseGeocode(lat, lng);
      expect(result).toEqual({ ok: false, address: null, error: 'Service unavailable' });
    });
  });
});
