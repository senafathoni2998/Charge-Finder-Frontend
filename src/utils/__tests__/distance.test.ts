import { describe, it, expect } from 'vitest';
import { 
    statusLabel, 
    formatCurrency, 
    haversineKm, 
    boundsFromStations, 
    filterStations 
} from '../distance';

describe('distance utils', () => {

    describe('statusLabel', () => {
        it('should return "Available" for AVAILABLE status', () => {
            expect(statusLabel('AVAILABLE')).toBe('Available');
        });

        it('should return "Busy" for BUSY status', () => {
            expect(statusLabel('BUSY')).toBe('Busy');
        });

        it('should return "Offline" for other statuses', () => {
            expect(statusLabel('OFFLINE' as any)).toBe('Offline');
            expect(statusLabel(undefined as any)).toBe('Offline');
        });
    });

    describe('formatCurrency', () => {
        it('should handle undefined/null value', () => {
             expect(formatCurrency('USD')).toBe('—');
             expect(formatCurrency('USD', undefined)).toBe('—');
        });

        it('should format zero correctly', () => {
            expect(formatCurrency('USD', 0)).toBe('USD 0');
        });

        it('should format numbers with currency', () => {
            expect(formatCurrency('USD', 1234.56)).toBe('USD 1,234.56');
        });
    });

    describe('haversineKm', () => {
        it('should calculate distance between two points', () => {
            // New York (40.7128, -74.0060) to London (51.5074, -0.1278) -> approx 5570 km
            const ny = { lat: 40.7128, lng: -74.0060 };
            const london = { lat: 51.5074, lng: -0.1278 };
            
            const dist = haversineKm(ny, london);
            expect(dist).toBeGreaterThan(5560);
            expect(dist).toBeLessThan(5580);
        });

        it('should return 0 for same location', () => {
            const point = { lat: 10, lng: 10 };
            expect(haversineKm(point, point)).toBe(0);
        });
    });

    describe('boundsFromStations', () => {
        it('should return default bounds for empty stations', () => {
            const bounds = boundsFromStations([]);
            expect(bounds).toEqual(expect.objectContaining({
                minLat: expect.any(Number),
                maxLat: expect.any(Number),
                minLng: expect.any(Number),
                maxLng: expect.any(Number),
                latSpan: 0.35,
                lngSpan: 0.45,
            }));
        });

        it('should calculate bounds correctly for stations', () => {
            const stations = [
                { lat: 10, lng: 10 },
                { lat: 20, lng: 20 },
            ];
            const bounds = boundsFromStations(stations);
            expect(bounds.minLat).toBe(10);
            expect(bounds.maxLat).toBe(20);
            expect(bounds.minLng).toBe(10);
            expect(bounds.maxLng).toBe(20);
            // Spans
            expect(bounds.latSpan).toBe(10);
            expect(bounds.lngSpan).toBe(10);
        });
        
        it('should handle single station (min span)', () => {
             const stations = [{ lat: 10, lng: 10 }];
             const bounds = boundsFromStations(stations);
             expect(bounds.minLat).toBe(10);
             expect(bounds.maxLat).toBe(10);
             expect(bounds.latSpan).toBe(0.00001); // min span
        });

        it('should filter out invalid coordinates', () => {
             const stations = [
                { lat: 10, lng: 10 },
                { lat: 'invalid', lng: 20 },
                { lat: 20, lng: undefined },
            ];
            const bounds = boundsFromStations(stations);
            expect(bounds.minLat).toBe(10);
            expect(bounds.maxLat).toBe(10);
        });
    });

    describe('filterStations', () => {
        const stations = [
            { 
                id: 1, name: 'Station A', address: '123 Main St', 
                status: 'AVAILABLE', lat: 10, lng: 10,
                connectors: [{ type: 'Type2', powerKW: 22 }],
                isChargingHere: false 
            },
            { 
                id: 2, name: 'Station B', address: '456 Elm St', 
                status: 'BUSY', lat: 10.01, lng: 10.01,
                connectors: [{ type: 'CCS', powerKW: 50 }],
                isChargingHere: true 
            },
            { 
                id: 3, name: 'Far Station', address: 'Nowhere', 
                status: 'AVAILABLE', lat: 11, lng: 11, // Far away
                connectors: [{ type: 'Type2', powerKW: 7 }],
                isChargingHere: false 
            }
        ];
        const userCenter = { lat: 10, lng: 10 };
        
        it('should filter by query (name/address)', () => {
            const filters = { q: 'main', connectorSet: new Set(), minKW: 0, radiusKm: 1000 };
            const result = filterStations(stations, filters, userCenter);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Station A');
        });

        it('should filter by status', () => {
            const filters = { q: '', connectorSet: new Set(), minKW: 0, status: 'BUSY', radiusKm: 1000 };
            const result = filterStations(stations, filters, userCenter);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Station B');
        });

        it('should filter by connector type', () => {
            const filters = { q: '', connectorSet: new Set(['CCS']), minKW: 0, radiusKm: 1000 };
            const result = filterStations(stations, filters, userCenter);
             expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Station B');
        });

        it('should filter by minKW', () => {
            const filters = { q: '', connectorSet: new Set(), minKW: 40, radiusKm: 1000 };
            const result = filterStations(stations, filters, userCenter);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Station B');
        });

        it('should filter by radius/distance', () => {
            const filters = { q: '', connectorSet: new Set(), minKW: 0, radiusKm: 5 }; // ~10km to 10.01,10.01 is about 1.5km
            
            // Calc specific distance to be sure
            // A is at 0km. B is close. Far is far.
            const result = filterStations(stations, filters, userCenter);
            expect(result.find(s => s.name === 'Station A')).toBeDefined();
            expect(result.find(s => s.name === 'Station B')).toBeDefined();
            expect(result.find(s => s.name === 'Far Station')).toBeUndefined();
        });

        it('should sort charging stations first', () => {
             const filters = { q: '', connectorSet: new Set(), minKW: 0, radiusKm: 1000 };
             const result = filterStations(stations, filters, userCenter);
             
             // Station B is charging here, likely should be first if logic puts charging first
             // Code: Number(Boolean(b.isChargingHere)) - Number(Boolean(a.isChargingHere));
             // So if B is true (1) and A is false (0), 1-0 = 1 (positive).
             // Sort ascending? logic: .sort((a,b)) -> return >0 means b comes before a? 
             // MDN: if > 0, sort b before a. So yes, charging stations first.

             expect(result[0].name).toBe('Station B');
             expect(result[1].name).toBe('Station A'); // A is closer
             expect(result[2].name).toBe('Far Station');
        });
    });

});
