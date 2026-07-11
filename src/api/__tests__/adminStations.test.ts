import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStation, updateStation, deleteStation } from '../adminStations';

describe('adminStations API', () => {
  const baseUrl = 'http://localhost:3000';

  // A fully-shaped station payload (what buildStationPayload produces at runtime),
  // used by the multipart/feature-image cases.
  const fullPayload: any = {
    name: 'Hero Station',
    address: '1 Main St',
    status: 'AVAILABLE',
    lat: -6.2,
    lng: 106.8,
    connectors: [{ type: 'CCS2', powerKW: 50, ports: 2, availablePorts: 1 }],
    pricing: { currency: 'IDR', perKwh: 2700 },
    amenities: ['Wi-Fi'],
    photos: [],
    notes: null,
    lastUpdatedISO: '2026-01-01T00:00:00.000Z',
  };

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

    it('sends multipart FormData when a feature image is provided', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: { id: '1' } }),
      });
      const image = new File(['x'], 'hero.png', { type: 'image/png' });

      const result = await createStation(fullPayload, { image });

      expect(result.ok).toBe(true);
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/add-station`);
      expect(init.method).toBe('POST');
      expect(init.body).toBeInstanceOf(FormData);
      const form = init.body as FormData;
      expect(form.get('featuredImage')).toBe(image);
      expect(form.get('name')).toBe('Hero Station');
      expect(JSON.parse(form.get('connectors') as string)).toEqual(
        fullPayload.connectors
      );
      expect(JSON.parse(form.get('pricing') as string)).toEqual(
        fullPayload.pricing
      );
    });

    it('rejects a non-image file without calling fetch', async () => {
      const notImage = new File(['x'], 'a.txt', { type: 'text/plain' });

      const result = await createStation(fullPayload, { image: notImage });

      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'The feature image must be a PNG or JPG image.',
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects an image type the backend does not accept (e.g. webp)', async () => {
      const webp = new File(['x'], 'hero.webp', { type: 'image/webp' });

      const result = await createStation(fullPayload, { image: webp });

      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'The feature image must be a PNG or JPG image.',
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects an oversized image without calling fetch', async () => {
      const big = new File([new Uint8Array(500001)], 'big.png', {
        type: 'image/png',
      });

      const result = await createStation(fullPayload, { image: big });

      expect(result).toEqual({
        ok: false,
        station: null,
        error: 'The feature image must be smaller than 500 KB.',
      });
      expect(fetch).not.toHaveBeenCalled();
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

    it('sends a new feature image as multipart FormData', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: { id: stationId } }),
      });
      const image = new File(['x'], 'hero.png', { type: 'image/png' });

      const result = await updateStation(stationId, fullPayload, { image });

      expect(result.ok).toBe(true);
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/update-station`);
      expect(init.method).toBe('PATCH');
      expect(init.body).toBeInstanceOf(FormData);
      const form = init.body as FormData;
      expect(form.get('stationId')).toBe(stationId);
      expect(form.get('featuredImage')).toBe(image);
    });

    it('sends the removeFeaturedImage flag as multipart FormData', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ station: { id: stationId } }),
      });

      const result = await updateStation(stationId, fullPayload, {
        removeFeaturedImage: true,
      });

      expect(result.ok).toBe(true);
      const [, init] = (global.fetch as any).mock.calls[0];
      expect(init.body).toBeInstanceOf(FormData);
      const form = init.body as FormData;
      expect(form.get('removeFeaturedImage')).toBe('true');
      expect(form.get('stationId')).toBe(stationId);
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
