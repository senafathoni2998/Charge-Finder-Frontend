import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useEditStationFormState from '../useEditStationFormState';
import { reverseGeocode } from '../../../../api/geocode';
import { useGeoLocation } from '../../../../hooks/geolocation-hook';
import type { Station } from '../../../../models/model';
import * as utils from '../../utils';

// Mock dependencies
vi.mock('../../../../api/geocode');
vi.mock('../../../../hooks/geolocation-hook');

vi.mock('../../utils', async () => {
    const actual = await vi.importActual<typeof import('../../utils')>('../../utils');
    return {
        ...actual,
        validateStationForm: vi.fn(() => null),
    };
});

const mockStation: Station = {
    id: 's1',
    name: 'Test Station',
    address: '123 Test St',
    status: 'AVAILABLE',
    lat: 50,
    lng: 10,
    connectors: [
        { type: 'Type2', powerKW: 22, ports: 2, availablePorts: 2 },
    ],
    photos: [],
    pricing: { currency: 'IDR', perKwh: 10000 },
    lastUpdatedISO: '2025-01-24T10:00:00Z',
};

const mockGeoLocation = {
    loc: { lat: 50, lng: 10 },
    loading: false,
    error: null,
    request: vi.fn(),
};

describe('useEditStationFormState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useGeoLocation as any).mockReturnValue(mockGeoLocation);
        // Reset reverseGeocode mock to avoid unhandled rejections
        (reverseGeocode as any).mockReset().mockResolvedValue({
            ok: false,
            error: 'Mock error',
        });
    });

    afterEach(() => {
        // Clean up any pending promises with a safe default
        (reverseGeocode as any).mockReset().mockResolvedValue({
            ok: false,
            error: 'Mock error',
        });
    });

    it('should initialize with default station values', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        expect(result.current.values.name).toBe('Test Station');
        expect(result.current.values.address).toBe('123 Test St');
        expect(result.current.formError).toBeNull();
    });

    it('should update name when onNameChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onNameChange('New Station Name');
        });

        expect(result.current.values.name).toBe('New Station Name');
    });

    it('should update address when onAddressChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onAddressChange('New Address');
        });

        expect(result.current.values.address).toBe('New Address');
    });

    it('should update status when onStatusChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onStatusChange('BUSY');
        });

        expect(result.current.values.status).toBe('BUSY');
    });

    it('should update lat when onLatChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onLatChange('51');
        });

        expect(result.current.values.lat).toBe('51');
    });

    it('should update lng when onLngChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onLngChange('11');
        });

        expect(result.current.values.lng).toBe('11');
    });

    it('should update connector field when onConnectorChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        const connectorId = result.current.values.connectors[0].id;

        act(() => {
            result.current.handlers.onConnectorChange(connectorId, 'powerKW', '50');
        });

        expect(result.current.values.connectors[0].powerKW).toBe('50');
    });

    it('should add connector when onAddConnector is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        const initialLength = result.current.values.connectors.length;

        act(() => {
            result.current.handlers.onAddConnector();
        });

        expect(result.current.values.connectors).toHaveLength(initialLength + 1);
    });

    it('should not remove connector when only one connector exists', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        const initialConnectors = result.current.values.connectors;

        act(() => {
            result.current.handlers.onRemoveConnector('c1');
        });

        expect(result.current.values.connectors).toEqual(initialConnectors);
    });

    it('should remove connector when multiple connectors exist', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onAddConnector();
        });

        const newConnectors = result.current.values.connectors;
        const lastId = newConnectors[newConnectors.length - 1].id;

        act(() => {
            result.current.handlers.onRemoveConnector(lastId);
        });

        expect(result.current.values.connectors).toHaveLength(1);
    });

    it('should update pricing when onPricingChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onPricingChange('perKwh', '15000');
        });

        expect(result.current.values.pricing.perKwh).toBe('15000');
    });

    it('should update amenities when onAmenitiesChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onAmenitiesChange('WiFi, Cafe');
        });

        expect(result.current.values.amenities).toBe('WiFi, Cafe');
    });

    it('should add photo when onAddPhoto is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        const initialLength = result.current.values.photos.length;

        act(() => {
            result.current.handlers.onAddPhoto();
        });

        expect(result.current.values.photos).toHaveLength(initialLength + 1);
    });

    it('should remove photo when onRemovePhoto is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onAddPhoto();
        });

        const newPhotos = result.current.values.photos;
        const lastId = newPhotos[newPhotos.length - 1].id;

        act(() => {
            result.current.handlers.onRemovePhoto(lastId);
        });

        expect(result.current.values.photos).toHaveLength(1);
    });

    it('should update notes when onNotesChange is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.handlers.onNotesChange('Station notes');
        });

        expect(result.current.values.notes).toBe('Station notes');
    });

    it('should set formError when validation fails', () => {
        const spy = vi.spyOn(utils, 'validateStationForm').mockReturnValue('Validation error');

        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        const event = new Event('submit', { cancelable: true }) as any;
        event.preventDefault = vi.fn();

        act(() => {
            result.current.onSubmit(event);
        });

        expect(result.current.formError).toBe('Validation error');
        expect(event.preventDefault).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('should clear formError when validation passes', () => {
        // First, create an error by failing validation
        const spy = vi.spyOn(utils, 'validateStationForm')
            .mockReturnValueOnce('Validation error')
            .mockReturnValueOnce(null); // Second call passes

        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        // Trigger validation to set the error
        const event1 = new Event('submit', { cancelable: true }) as any;
        event1.preventDefault = vi.fn();

        act(() => {
            result.current.onSubmit(event1);
        });

        expect(result.current.formError).toBe('Validation error');

        // Now submit again with passing validation
        const event2 = new Event('submit', { cancelable: true }) as any;
        event2.preventDefault = vi.fn();

        act(() => {
            result.current.onSubmit(event2);
        });

        expect(result.current.formError).toBeNull();

        spy.mockRestore();
    });

    it('should call geo.request when onRequestLocation is called', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        act(() => {
            result.current.onRequestLocation();
        });

        expect(mockGeoLocation.request).toHaveBeenCalled();
    });

    it('should call reverseGeocode when onPickLocation is called', async () => {
        (reverseGeocode as any).mockResolvedValue({
            ok: true,
            address: 'Resolved Address',
        });

        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        await act(async () => {
            await result.current.onPickLocation(51, 11);
        });

        expect(reverseGeocode).toHaveBeenCalledWith(51, 11, expect.any(AbortSignal));
        expect(result.current.values.address).toBe('Resolved Address');
    });

    it('should set locationError when reverseGeocode fails', async () => {
        (reverseGeocode as any).mockResolvedValue({
            ok: false,
            error: 'Geocode error',
        });

        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        await act(async () => {
            await result.current.onPickLocation(51, 11);
        });

        expect(result.current.locationError).toBe('Geocode error');
    });

    it('should return correct locationCenter', () => {
        const { result } = renderHook(() =>
            useEditStationFormState(mockStation, 'Type2')
        );

        // The locationCenter should use the station's lat/lng
        expect(result.current.locationCenter).toEqual({ lat: 50, lng: 10 });
    });
});
