import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestChargingTicket, fetchActiveTicketForStation } from '../tickets';

describe('tickets API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('requestChargingTicket', () => {
    const validParams = { stationId: 'station-123', ticketKwh: 10 };

    it('should return error if stationId is missing', async () => {
      const result = await requestChargingTicket({ stationId: '' });
      expect(result).toEqual({ ok: false, error: "Station is missing." });
    });

    it('should request ticket successfully', async () => {
      const mockTicket = { id: 'ticket-1', kwh: 10 };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ticket: mockTicket }),
      });

      const result = await requestChargingTicket(validParams);
      expect(result).toEqual({ ok: true, ticket: mockTicket });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/request-ticket`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validParams),
      }));
    });
  });

  describe('fetchActiveTicketForStation', () => {
    const stationId = 'station-123';

    it('should return error if stationId is missing', async () => {
      const result = await fetchActiveTicketForStation('');
      expect(result).toEqual({ ok: false, error: "Station is missing." });
    });

    it('should fetch active ticket successfully', async () => {
      const mockTicket = { id: 'ticket-1', status: 'active' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ticket: mockTicket }),
      });

      const result = await fetchActiveTicketForStation(stationId);
      expect(result).toEqual({ ok: true, ticket: mockTicket });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/${stationId}/active-ticket`, expect.objectContaining({ method: 'GET' }));
    });
  });
});
