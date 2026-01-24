import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startChargingSession, updateChargingProgress, completeChargingSession, cancelChargingSession } from '../charging';

describe('charging API', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubEnv('VITE_APP_BACKEND_URL', baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('startChargingSession', () => {
    const validParams = {
      stationId: 'station-123',
      connectorType: 'Type 2' as any,
    };

    it('should return error if stationId is missing', async () => {
      const result = await startChargingSession({ stationId: '' });
      expect(result).toEqual({ ok: false, error: "Station is missing." });
    });

    it('should start charging successfully', async () => {
      const mockTicket = { id: 'ticket-1' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ticket: mockTicket }),
      });

      const result = await startChargingSession(validParams);
      expect(result).toEqual({ ok: true, ticket: mockTicket });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/start-charging`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ stationId: validParams.stationId, connectorType: validParams.connectorType }),
      }));
    });
  });

  describe('updateChargingProgress', () => {
    const validParams = {
      stationId: 'station-123',
      progressPercent: 50,
    };

    it('should return error if progressPercent is invalid', async () => {
      const result = await updateChargingProgress({ ...validParams, progressPercent: NaN });
      expect(result).toEqual({ ok: false, error: "Progress percent is invalid." });
    });

    it('should update progress successfully', async () => {
      const mockTicket = { id: 'ticket-1', progress: 50 };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ticket: mockTicket }),
      });

      const result = await updateChargingProgress(validParams);
      expect(result).toEqual({ ok: true, ticket: mockTicket });
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/charging-progress`, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(validParams),
      }));
    });
  });

  describe('completeChargingSession', () => {
    const stationId = 'station-123';

    it('should complete session successfully', async () => {
      const mockTicket = { id: 'ticket-1', status: 'completed' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ completedTicket: mockTicket }),
      });

      const result = await completeChargingSession({ stationId });
      expect(result).toEqual({ ok: true, ticket: mockTicket });
    });

    it('should handle cancel inside complete', async () => {
        const mockTicket = { id: 'ticket-1', status: 'cancelled' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ cancelledTicket: mockTicket }),
        });

        const result = await completeChargingSession({ stationId, cancel: true });
        expect(result).toEqual({ ok: true, ticket: mockTicket });
        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/stations/complete-charging`, expect.objectContaining({
             body: JSON.stringify({ stationId, cancel: true }),
        }));
    });
  });

  describe('cancelChargingSession', () => {
    const stationId = 'station-123';

    it('should cancel session successfully', async () => {
      const mockTicket = { id: 'ticket-1', status: 'cancelled' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ cancelledTicket: mockTicket }),
      });

      const result = await cancelChargingSession({ stationId });
      expect(result).toEqual({ ok: true, ticket: mockTicket });
    });
  });
});
