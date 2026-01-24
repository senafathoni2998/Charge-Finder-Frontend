import { describe, it, expect, vi } from 'vitest';
import {
    makeId,
    createDefaultConnector,
    createDefaultPhoto,
    buildEditStationDefaults,
    getMapCenter,
    validateStationForm,
} from '../utils';
import type { Station } from '../../models/model';
import type { StationFormValues } from '../AddStation/components/StationFormCard';

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

        it('should create connector with Type2', () => {
            const connector = createDefaultConnector('Type2' as any);
            expect(connector.type).toBe('Type2');
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
            const center = getMapCenter('50', '10');

            expect(center).toEqual({ lat: 50, lng: 10 });
        });

        it('should return fallback when lat is invalid', () => {
            const fallback = { lat: 40, lng: 20 };
            const center = getMapCenter('', '10', fallback);

            expect(center).toEqual(fallback);
        });

        it('should return fallback when lng is invalid', () => {
            const fallback = { lat: 40, lng: 20 };
            const center = getMapCenter('50', '', fallback);

            expect(center).toEqual(fallback);
        });

        it('should return default center when no fallback provided', () => {
            const center = getMapCenter('', '');

            expect(center).toEqual({ lat: -6.2, lng: 106.8167 });
        });

        it('should parse trimmed whitespace lat/lng', () => {
            const center = getMapCenter(' 50 ', ' 10 ');

            expect(center).toEqual({ lat: 50, lng: 10 });
        });
    });

    describe('validateStationForm', () => {
        const validForm: StationFormValues = {
            name: 'Test Station',
            address: '123 Test St',
            status: 'AVAILABLE',
            lat: '50',
            lng: '10',
            connectors: [
                { id: 'c1', type: 'Type2', powerKW: '22', ports: '2', availablePorts: '2' },
            ],
            pricing: {
                currency: 'IDR',
                perKwh: '10000',
                perMinute: '',
                parkingFee: '',
            },
            amenities: '',
            photos: [],
            notes: '',
        };

        it('should return null for valid form', () => {
            const error = validateStationForm(validForm);
            expect(error).toBeNull();
        });

        it('should return error when name is empty', () => {
            const form = { ...validForm, name: '   ' };
            expect(validateStationForm(form)).toBe('Station name is required.');
        });

        it('should return error when address is empty', () => {
            const form = { ...validForm, address: '' };
            expect(validateStationForm(form)).toBe('Address is required.');
        });

        it('should return error when lat is empty', () => {
            const form = { ...validForm, lat: '' };
            expect(validateStationForm(form)).toBe('Latitude and longitude must be valid numbers.');
        });

        it('should return error when lng is empty', () => {
            const form = { ...validForm, lng: '' };
            expect(validateStationForm(form)).toBe('Latitude and longitude must be valid numbers.');
        });

        it('should return error when lat is not a number', () => {
            const form = { ...validForm, lat: 'invalid' };
            expect(validateStationForm(form)).toBe('Latitude and longitude must be valid numbers.');
        });

        it('should return error when connectors array is empty', () => {
            const form = { ...validForm, connectors: [] };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when connector type is missing', () => {
            const form = {
                ...validForm,
                connectors: [
                    { id: 'c1', type: '', powerKW: '22', ports: '2', availablePorts: '2' },
                ],
            };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when connector power is invalid', () => {
            const form = {
                ...validForm,
                connectors: [
                    { id: 'c1', type: 'Type2', powerKW: 'invalid', ports: '2', availablePorts: '2' },
                ],
            };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when connector power is zero', () => {
            const form = {
                ...validForm,
                connectors: [
                    { id: 'c1', type: 'Type2', powerKW: '0', ports: '2', availablePorts: '2' },
                ],
            };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when connector ports is zero', () => {
            const form = {
                ...validForm,
                connectors: [
                    { id: 'c1', type: 'Type2', powerKW: '22', ports: '0', availablePorts: '2' },
                ],
            };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when connector availablePorts is negative', () => {
            const form = {
                ...validForm,
                connectors: [
                    { id: 'c1', type: 'Type2', powerKW: '22', ports: '2', availablePorts: '-1' },
                ],
            };
            expect(validateStationForm(form)).toBe('Add at least one valid connector entry.');
        });

        it('should return error when pricing currency is empty', () => {
            const form = {
                ...validForm,
                pricing: { ...validForm.pricing, currency: '' },
            };
            expect(validateStationForm(form)).toBe('Pricing currency and per kWh are required.');
        });

        it('should return error when pricing perKwh is empty', () => {
            const form = {
                ...validForm,
                pricing: { ...validForm.pricing, perKwh: '' },
            };
            expect(validateStationForm(form)).toBe('Pricing currency and per kWh are required.');
        });

        it('should return error when pricing perKwh is not a number', () => {
            const form = {
                ...validForm,
                pricing: { ...validForm.pricing, perKwh: 'invalid' },
            };
            expect(validateStationForm(form)).toBe('Pricing currency and per kWh are required.');
        });
    });
});
