import { describe, it, expect } from 'vitest';
import {
    makeId,
    createDefaultConnector,
    createDefaultPhoto,
    buildEditStationDefaults,
    getMapCenter,
} from '../utils';
import type { Station } from '../../../models/model';

describe('EditStation utils', () => {
    describe('makeId', () => {
        it('should generate unique IDs with prefix', () => {
            const id1 = makeId('test');
            const id2 = makeId('test');

            expect(id1).toContain('test-');
            expect(id2).toContain('test-');
            expect(id1).not.toBe(id2);
        });

        it('should include timestamp in ID', () => {
            const id = makeId('connector');

            const timestampMatch = id.match(/connector-(\d+)-/);
            expect(timestampMatch).toBeTruthy();

            const timestamp = parseInt(timestampMatch![1], 10);
            expect(timestamp).toBeGreaterThan(0);
            expect(timestamp).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('createDefaultConnector', () => {
        it('should create connector with default values', () => {
            const connector = createDefaultConnector('Type2' as any);

            expect(connector.type).toBe('Type2');
            expect(connector.powerKW).toBe('50');
            expect(connector.ports).toBe('2');
            expect(connector.availablePorts).toBe('2');
            expect(connector.id).toContain('connector-');
        });

        it('should create connector with CCS2', () => {
            const connector = createDefaultConnector('CCS2' as any);
            expect(connector.type).toBe('CCS2');
        });
    });

    describe('createDefaultPhoto', () => {
        it('should create photo with empty values', () => {
            const photo = createDefaultPhoto();

            expect(photo.id).toContain('photo-');
            expect(photo.label).toBe('');
            expect(photo.gradient).toBe('');
        });
    });

    describe('buildEditStationDefaults', () => {
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

        it('should build form defaults from station', () => {
            const defaults = buildEditStationDefaults(mockStation, 'CCS2' as any);

            expect(defaults.name).toBe('Test Station');
            expect(defaults.address).toBe('123 Test St');
            expect(defaults.status).toBe('AVAILABLE');
            expect(defaults.lat).toBe('50');
            expect(defaults.lng).toBe('10');
        });

        it('should build connector drafts from station connectors', () => {
            const defaults = buildEditStationDefaults(mockStation, 'CCS2' as any);

            expect(defaults.connectors).toHaveLength(1);
            expect(defaults.connectors[0].type).toBe('Type2');
            expect(defaults.connectors[0].powerKW).toBe('22');
            expect(defaults.connectors[0].ports).toBe('2');
            expect(defaults.connectors[0].availablePorts).toBe('2');
        });

        it('should build photo drafts from station photos', () => {
            const stationWithPhotos: Station = {
                ...mockStation,
                photos: [{ label: 'Photo 1', gradient: 'linear-gradient(to right, #fff, #000)' }],
            };
            const defaults = buildEditStationDefaults(stationWithPhotos, 'CCS2' as any);

            expect(defaults.photos).toHaveLength(1);
            expect(defaults.photos[0].label).toBe('Photo 1');
            expect(defaults.photos[0].gradient).toBe('linear-gradient(to right, #fff, #000)');
        });

        it('should build pricing from station pricing', () => {
            const defaults = buildEditStationDefaults(mockStation, 'CCS2' as any);

            expect(defaults.pricing.currency).toBe('IDR');
            expect(defaults.pricing.perKwh).toBe('10000');
        });

        it('should return empty defaults when station is null', () => {
            const defaults = buildEditStationDefaults(null, 'CCS2' as any);

            expect(defaults.name).toBe('');
            expect(defaults.address).toBe('');
            expect(defaults.status).toBe('AVAILABLE');
            expect(defaults.lat).toBe('');
            expect(defaults.lng).toBe('');
        });

        it('should create default connector when station has no connectors', () => {
            const stationWithoutConnectors: Station = {
                ...mockStation,
                connectors: [],
            };
            const defaults = buildEditStationDefaults(stationWithoutConnectors, 'CCS2' as any);

            expect(defaults.connectors).toHaveLength(1);
            expect(defaults.connectors[0].type).toBe('CCS2');
            expect(defaults.connectors[0].powerKW).toBe('50');
        });

        it('should create default photo when station has no photos', () => {
            const stationWithoutPhotos: Station = {
                ...mockStation,
                photos: [],
            };
            const defaults = buildEditStationDefaults(stationWithoutPhotos, 'CCS2' as any);

            expect(defaults.photos).toHaveLength(1);
            expect(defaults.photos[0].label).toBe('');
            expect(defaults.photos[0].gradient).toBe('');
        });
    });

    describe('getMapCenter', () => {
        it('should return lat/lng when both are valid', () => {
            expect(getMapCenter('50', '10')).toEqual({ lat: 50, lng: 10 });
        });

        it('should return fallback when lat is invalid', () => {
            const fallback = { lat: 40, lng: 20 };
            expect(getMapCenter('', '10', fallback)).toEqual(fallback);
        });

        it('should return fallback when lng is invalid', () => {
            const fallback = { lat: 40, lng: 20 };
            expect(getMapCenter('50', '', fallback)).toEqual(fallback);
        });

        it('should return default center when no fallback provided', () => {
            expect(getMapCenter('', '')).toEqual({ lat: -6.2, lng: 106.8167 });
        });

        it('should parse trimmed whitespace lat/lng', () => {
            expect(getMapCenter(' 50 ', ' 10 ')).toEqual({ lat: 50, lng: 10 });
        });
    });
});
