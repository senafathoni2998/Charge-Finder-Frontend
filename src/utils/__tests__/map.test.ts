import { describe, it, expect } from 'vitest';
import { statusColor, CHARGING_COLOR } from '../map';

describe('map utils', () => {
    describe('statusColor', () => {
        it('should return CHARGING_COLOR if isChargingHere is true', () => {
            expect(statusColor('AVAILABLE', true)).toBe(CHARGING_COLOR);
            expect(statusColor('BUSY', true)).toBe(CHARGING_COLOR);
            expect(statusColor('OFFLINE', true)).toBe(CHARGING_COLOR);
        });

        it('should return correct color for AVAILABLE', () => {
            expect(statusColor('AVAILABLE')).toBe('rgba(0,229,255,0.95)');
        });

        it('should return correct color for BUSY', () => {
            expect(statusColor('BUSY')).toBe('rgba(255,193,7,0.95)');
        });

        it('should return correct color for OFFLINE/Others', () => {
            expect(statusColor('OFFLINE')).toBe('rgba(244,67,54,0.95)');
            expect(statusColor('UNKNOWN')).toBe('rgba(244,67,54,0.95)');
        });
    });
});
