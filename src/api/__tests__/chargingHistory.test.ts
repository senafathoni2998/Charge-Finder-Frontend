import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchChargingHistory } from '../chargingHistory';

describe('chargingHistory API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('fetchChargingHistory', () => {
    it('should load charging history successfully', async () => {
      const mockHistory = [{ id: 'ticket-1', date: '2023-01-01' }];
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ history: mockHistory }),
      });

      const result = await fetchChargingHistory();
      expect(result).toEqual({ ok: true, history: mockHistory });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/profile/charging-history`, expect.objectContaining({ method: 'GET' }));
    });

    it('should return empty list on error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Error' }),
      });

      const result = await fetchChargingHistory();
      expect(result).toEqual({ ok: false, history: [], error: 'Error' });
    });
  });
});
