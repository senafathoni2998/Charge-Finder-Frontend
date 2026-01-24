import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useStationManagement from '../useStationManagement';
import * as stationApi from '../../../../api/stations';
import * as adminApi from '../../../../api/adminStations';

vi.mock('../../../../api/stations');
vi.mock('../../../../api/adminStations');

describe('useStationManagement', () => {
    const mockStations = [
        { id: 's1', name: 'Station A', address: 'City A', status: 'AVAILABLE', connectors: [{ type: 'Type2', powerKW: 22 }] },
        { id: 's2', name: 'Station B', address: 'City B', status: 'OFFLINE', connectors: [{ type: 'CCS2', powerKW: 50 }] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (stationApi.fetchStations as any).mockResolvedValue({ ok: true, stations: mockStations });
    });

    it('should fetch stations on mount', async () => {
        const { result } = renderHook(() => useStationManagement());

        expect(result.current.stationsLoading).toBe(true);
        
        await waitFor(() => {
            expect(result.current.stationsLoading).toBe(false);
        });

        expect(result.current.stations).toHaveLength(2);
        expect(result.current.filteredStations).toHaveLength(2);
    });

    it('should filter stations by query', async () => {
        const { result } = renderHook(() => useStationManagement());
        await waitFor(() => expect(result.current.stationsLoading).toBe(false));

        act(() => {
            result.current.onStationQueryChange('Station A');
        });

        expect(result.current.filteredStations).toHaveLength(1);
        expect(result.current.filteredStations[0].name).toBe('Station A');
    });

    it('should filter stations by status', async () => {
        const { result } = renderHook(() => useStationManagement());
        await waitFor(() => expect(result.current.stationsLoading).toBe(false));

        act(() => {
            result.current.onStationStatusFilterChange('OFFLINE');
        });

        expect(result.current.filteredStations).toHaveLength(1);
        expect(result.current.filteredStations[0].status).toBe('OFFLINE');
    });

    it('should filter by connector type', async () => {
        const { result } = renderHook(() => useStationManagement());
        await waitFor(() => expect(result.current.stationsLoading).toBe(false));

        act(() => {
            result.current.toggleStationConnector('CCS2');
        });

        expect(result.current.filteredStations).toHaveLength(1);
        expect(result.current.filteredStations[0].connectors[0].type).toBe('CCS2');
    });

    it('should handle delete station', async () => {
        (adminApi.deleteStation as any).mockResolvedValue({ ok: true });
        // Mock window.confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() => useStationManagement());
        await waitFor(() => expect(result.current.stationsLoading).toBe(false));

        await act(async () => {
            await result.current.handleDeleteStation(mockStations[0] as any);
        });

        expect(adminApi.deleteStation).toHaveBeenCalledWith('s1');
        expect(result.current.stations).toHaveLength(1);
        expect(result.current.stations[0].id).toBe('s2');
    });
});
