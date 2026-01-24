import { describe, it, expect } from 'vitest';
import { normalizeToCanvas } from '../canvasFunc';

describe('canvasFunc', () => {
    describe('normalizeToCanvas', () => {
        const bounds = {
            minLat: 0,
            maxLat: 10,
            minLng: 0,
            maxLng: 10,
            latSpan: 10,
            lngSpan: 10
        };

        it('should normalize coordinates correctly inside valid range', () => {
            const result = normalizeToCanvas(5, 5, bounds);
            // x = (5 - 0) / 10 = 0.5
            // y = 1 - (5 - 0) / 10 = 0.5
            expect(result).toEqual({ x: 0.5, y: 0.5 });
        });

        it('should clamp min values', () => {
            const result = normalizeToCanvas(-1, -1, bounds);
            // x = -0.1 -> clamped to 0.02
            // y = 1 - (-0.1) = 1.1 -> clamped to 0.98
            // Wait, y formula: 1 - (-1 - 0) / 10 = 1 - (-0.1) = 1.1. Clamped to 0.98.
            
            // Let's recheck logic:
            // x = (-1 - 0) / 10 = -0.1. Clamped to 0.02.
            // y = 1 - (-1 - 0) / 10 = 1.1. Clamped to 0.98.
            expect(result).toEqual({ x: 0.02, y: 0.98 });
        });

         it('should clamp max values', () => {
            const result = normalizeToCanvas(11, 11, bounds);
            // x = 1.1 -> clamped to 0.98
            // y = 1 - (1.1) = -0.1 -> clamped to 0.02
            expect(result).toEqual({ x: 0.98, y: 0.02 });
        });
    });
});
