import { describe, it, expect } from 'vitest';
import { parseStationFormData } from '../stationFormUtils';

describe('stationFormUtils', () => {
    
    const createValidFormData = () => {
        const fd = new FormData();
        fd.append('name', 'Test Station');
        fd.append('address', '123 Main St');
        fd.append('lat', '10.0');
        fd.append('lng', '20.0');
        fd.append('status', 'AVAILABLE');
        fd.append('connectors', JSON.stringify([
            { type: 'Type2', powerKW: 50, ports: 2, availablePorts: 2 }
        ]));
        fd.append('pricing', JSON.stringify({
            currency: 'USD',
            perKwh: 0.5,
            perMinute: 0,
        }));
        fd.append('amenities', JSON.stringify(['Wifi']));
        fd.append('photos', JSON.stringify([]));
        return fd;
    };

    it('should parse valid form data', () => {
        const fd = createValidFormData();
        const result = parseStationFormData(fd);
        
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.payload.name).toBe('Test Station');
            expect(result.payload.lat).toBe(10);
            expect(result.payload.connectors).toHaveLength(1);
            expect(result.payload.pricing.currency).toBe('USD');
        }
    });

    it('should require name and address', () => {
        const fd = createValidFormData();
        fd.delete('name');
        const r1 = parseStationFormData(fd);
        expect(r1.ok).toBe(false);
        expect((r1 as any).error).toMatch(/name is required/i);

        const fd2 = createValidFormData();
        fd2.delete('address');
        const r2 = parseStationFormData(fd2);
        expect(r2.ok).toBe(false);
        expect((r2 as any).error).toMatch(/address is required/i);
    });

    it('should require valid coordinates', () => {
        const fd = createValidFormData();
        fd.set('lat', 'invalid');
        const r1 = parseStationFormData(fd);
        expect(r1.ok).toBe(false);
        expect((r1 as any).error).toMatch(/latitude and longitude/i);
    });

    it('should require at least one valid connector', () => {
        const fd = createValidFormData();
        fd.set('connectors', JSON.stringify([]));
        const r1 = parseStationFormData(fd);
        expect(r1.ok).toBe(false);
        expect((r1 as any).error).toMatch(/at least one connector/i);

        fd.set('connectors', JSON.stringify([
            { type: 'InvalidType', powerKW: 50, ports: 1, availablePorts: 1 }
        ]));
        const r2 = parseStationFormData(fd);
        expect(r2.ok).toBe(false);
    });

    it('should require pricing', () => {
         const fd = createValidFormData();
         fd.set('pricing', JSON.stringify({}));
         const r1 = parseStationFormData(fd);
         expect(r1.ok).toBe(false);
         expect((r1 as any).error).toMatch(/pricing currency and per kwh/i);
    });
});
