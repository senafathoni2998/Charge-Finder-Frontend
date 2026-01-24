import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useEditStationLoader from '../useEditStationLoader';
import { fetchStations } from '../../../../api/stations';

vi.mock('../../../../api/stations');

describe('useEditStationLoader', () => {
    const mockStations = [
        {
            id: 's1',
            name: 'Station A',
            address: 'Address A',
            status: 'AVAILABLE',
            lat: 50,
            lng: 10,
            connectors: [],
            photos: [],
            pricing: { currency: 'IDR', perKwh: 10000 },
            lastUpdatedISO: '2025-01-24T10:00:00Z',
        },
        {
            id: 's2',
            name: 'Station B',
            address: 'Address B',
            status: 'OFFLINE',
            lat: 51,
            lng: 11,
            connectors: [],
            photos: [],
            pricing: { currency: 'IDR', perKwh: 15000 },
            lastUpdatedISO: '2025-01-24T10:00:00Z',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (fetchStations as any).mockResolvedValue({
            ok: true,
            stations: mockStations,
        });
    });

    it('should fetch station by id on mount', async () => {
        const { result } = renderHook(() => useEditStationLoader('s1'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.station).toEqual(mockStations[0]);
        expect(result.current.error).toBeNull();
    });

    it('should return null station when stationId is undefined', async () => {
        const { result } = renderHook(() => useEditStationLoader(undefined));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.station).toBeNull();
        expect(result.current.error).toBe('Station ID is missing.');
    });

    it('should return null station when stationId is empty string', async () => {
        const { result } = renderHook(() => useEditStationLoader(''));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.station).toBeNull();
        expect(result.current.error).toBe('Station ID is missing.');
    });

    it('should set error when station is not found', async () => {
        const { result } = renderHook(() => useEditStationLoader('nonexistent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.station).toBeNull();
        expect(result.current.error).toBe('Station not found.');
    });

    it('should handle fetchStations error', async () => {
        (fetchStations as any).mockResolvedValue({
            ok: false,
            error: 'Failed to fetch',
        });

        const { result } = renderHook(() => useEditStationLoader('s1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.station).toBeNull();
        expect(result.current.error).toBe('Failed to fetch');
    });

    it('should handle fetchStations returning error without error message', async () => {
        (fetchStations as any).mockResolvedValue({
            ok: false,
            error: undefined,
        });

        const { result } = renderHook(() => useEditStationLoader('s1'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Could not load stations.');
    });

    it('should refetch when stationId changes', async () => {
        const { result, rerender } = renderHook(
            (stationId) => useEditStationLoader(stationId),
            { initialProps: 's1' }
        );

        await waitFor(() => {
            expect(result.current.station).toEqual(mockStations[0]);
        });

        rerender('s2');

        await waitFor(() => {
            expect(result.current.station).toEqual(mockStations[1]);
        });
    });
});
