import { describe, it, expect } from 'vitest';
import { buildMapsUrl } from '../utils';

describe('buildMapsUrl', () => {
    it('should build a Google Maps URL with correct coordinates', () => {
        const url = buildMapsUrl(40.7128, -74.006);
        expect(url).toBe('https://www.google.com/maps/search/?api=1&query=40.7128,-74.006');
    });

    it('should handle positive coordinates', () => {
        const url = buildMapsUrl(51.5074, 0.1278);
        expect(url).toBe('https://www.google.com/maps/search/?api=1&query=51.5074,0.1278');
    });

    it('should handle negative coordinates', () => {
        const url = buildMapsUrl(-33.8688, 151.2093);
        expect(url).toBe('https://www.google.com/maps/search/?api=1&query=-33.8688,151.2093');
    });

    it('should handle zero coordinates', () => {
        const url = buildMapsUrl(0, 0);
        expect(url).toBe('https://www.google.com/maps/search/?api=1&query=0,0');
    });

    it('should handle decimal coordinates', () => {
        const url = buildMapsUrl(37.774929, -122.419418);
        expect(url).toBe('https://www.google.com/maps/search/?api=1&query=37.774929,-122.419418');
    });

    it('should include api=1 parameter', () => {
        const url = buildMapsUrl(1, 1);
        expect(url).toContain('api=1');
    });

    it('should use search endpoint', () => {
        const url = buildMapsUrl(1, 1);
        expect(url).toContain('/search/');
    });
});
