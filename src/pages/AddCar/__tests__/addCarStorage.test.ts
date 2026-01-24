import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { persistActiveCarId } from '../addCarStorage';

describe('addCarStorage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should persist valid carId to localStorage', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        persistActiveCarId('123');
        expect(setItemSpy).toHaveBeenCalledWith('cf_active_car_id', '123');
    });

    it('should persist numeric carId as string', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        persistActiveCarId(456);
        expect(setItemSpy).toHaveBeenCalledWith('cf_active_car_id', '456');
    });

    it('should not persist if carId is falsy', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        persistActiveCarId(null);
        persistActiveCarId(undefined);
        persistActiveCarId('');
        expect(setItemSpy).not.toHaveBeenCalled();
    });
});
