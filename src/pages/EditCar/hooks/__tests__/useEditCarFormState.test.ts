import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useEditCarFormState from '../useEditCarFormState';
import type { UserCar } from '../../../features/auth/authSlice';

describe('useEditCarFormState', () => {
    const mockCar: UserCar = {
        id: 'car1',
        name: 'Tesla Model 3',
        connectorTypes: ['Type2', 'CCS2'],
        minKW: 22,
        batteryCapacity: 75,
    };

    it('should initialize with car defaults', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        expect(result.current.values.name).toBe('Tesla Model 3');
        expect(result.current.values.connectors).toEqual(new Set(['Type2', 'CCS2']));
        expect(result.current.values.minKW).toBe(22);
        expect(result.current.values.batteryCapacity).toBe('75');
        expect(result.current.clientError).toBeNull();
    });

    it('should initialize with empty values when car is null', () => {
        const { result } = renderHook(() => useEditCarFormState(null));

        expect(result.current.values.name).toBe('');
        expect(result.current.values.connectors).toEqual(new Set([]));
        expect(result.current.values.minKW).toBe(0);
        expect(result.current.values.batteryCapacity).toBe('');
        expect(result.current.clientError).toBeNull();
    });

    it('should update name when onNameChange is called', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        act(() => {
            result.current.handlers.onNameChange('BMW i3');
        });

        expect(result.current.values.name).toBe('BMW i3');
    });

    it('should update minKW when onMinKWChange is called', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        act(() => {
            result.current.handlers.onMinKWChange(50);
        });

        expect(result.current.values.minKW).toBe(50);
    });

    it('should update battery capacity when onBatteryCapacityChange is called', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        act(() => {
            result.current.handlers.onBatteryCapacityChange('95');
        });

        expect(result.current.values.batteryCapacity).toBe('95');
    });

    it('should add connector when onToggleConnector is called with new connector', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        act(() => {
            result.current.handlers.onToggleConnector('CHAdeMO');
        });

        expect(result.current.values.connectors).toEqual(new Set(['Type2', 'CCS2', 'CHAdeMO']));
    });

    it('should remove connector when onToggleConnector is called with existing connector', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        act(() => {
            result.current.handlers.onToggleConnector('Type2');
        });

        expect(result.current.values.connectors).toEqual(new Set(['CCS2']));
    });

    it('should clear client error when toggling connector', () => {
        const { result } = renderHook(() => useEditCarFormState(null));

        // Set an error first by calling onSubmit directly
        const event = new Event('submit', { cancelable: true }) as any;
        event.preventDefault = vi.fn();
        act(() => {
            result.current.onSubmit(event);
        });

        expect(result.current.clientError).toBe('Select at least one connector type.');

        // Clear error by adding a connector
        act(() => {
            result.current.handlers.onToggleConnector('Type2');
        });

        expect(result.current.clientError).toBeNull();
    });

    it('should prevent submit and set error when no connectors selected', () => {
        const { result } = renderHook(() => useEditCarFormState(null));

        const event = new Event('submit', { cancelable: true }) as any;
        event.preventDefault = vi.fn();

        act(() => {
            result.current.onSubmit(event);
        });

        expect(result.current.clientError).toBe('Select at least one connector type.');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow submit when connectors are selected', () => {
        const { result } = renderHook(() => useEditCarFormState(mockCar));

        const event = new Event('submit', { cancelable: true }) as any;
        event.preventDefault = vi.fn();

        act(() => {
            result.current.onSubmit(event);
        });

        expect(result.current.clientError).toBeNull();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should sync form values when car changes', () => {
        const { result, rerender } = renderHook(
            ({ car }) => useEditCarFormState(car),
            { initialProps: { car: mockCar } }
        );

        expect(result.current.values.name).toBe('Tesla Model 3');

        const newCar: UserCar = {
            id: 'car2',
            name: 'BMW i3',
            connectorTypes: ['Type2'],
            minKW: 11,
            batteryCapacity: 42,
        };

        rerender({ car: newCar });

        expect(result.current.values.name).toBe('BMW i3');
        expect(result.current.values.connectors).toEqual(new Set(['Type2']));
        expect(result.current.values.minKW).toBe(11);
        expect(result.current.values.batteryCapacity).toBe('42');
    });
});
