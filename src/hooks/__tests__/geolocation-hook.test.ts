import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeoLocation } from '../geolocation-hook';

describe('useGeoLocation', () => {
    beforeEach(() => {
        // Mock navigator.geolocation
        const geolocationMock = {
            getCurrentPosition: vi.fn(),
        };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: geolocationMock,
            writable: true,
        });
    });

    afterEach(() => {
         vi.restoreAllMocks();
    });

    it('should initialize with null state', () => {
        const { result } = renderHook(() => useGeoLocation());
        expect(result.current.loc).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle successful location retrieval', () => {
        const mockPosition = {
            coords: {
                latitude: 10,
                longitude: 20,
            },
        };
        (navigator.geolocation.getCurrentPosition as any).mockImplementation((success: any) => {
            success(mockPosition);
        });

        const { result } = renderHook(() => useGeoLocation());

        act(() => {
            result.current.request();
        });

        expect(result.current.loc).toEqual({ lat: 10, lng: 20 });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle location error', () => {
         const mockError = { message: 'Permission denied' };
         (navigator.geolocation.getCurrentPosition as any).mockImplementation((success: any, error: any) => {
             error(mockError);
         });
 
         const { result } = renderHook(() => useGeoLocation());
 
         act(() => {
             result.current.request();
         });
 
         expect(result.current.loc).toBeNull();
         expect(result.current.loading).toBe(false);
         expect(result.current.error).toBe('Permission denied');
     });

    it('should handle not supported environment', () => {
        Object.defineProperty(global.navigator, 'geolocation', {
             value: undefined,
             writable: true
        });
        
        const { result } = renderHook(() => useGeoLocation());
        act(() => {
            result.current.request();
        });

        expect(result.current.error).toBe('Geolocation is not supported in this environment.');
    });
});
