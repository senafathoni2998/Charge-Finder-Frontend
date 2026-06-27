import { describe, it, expect } from 'vitest';
import { stationFormSchema, type StationFormValues } from '../schemas';
import { buildStationPayload } from '../../pages/AddStation/stationFormUtils';

const validValues: StationFormValues = {
    name: 'Test Station',
    address: '123 Test St',
    status: 'AVAILABLE',
    lat: '10',
    lng: '20',
    connectors: [
        { id: 'c1', type: 'CCS2', powerKW: '50', ports: '2', availablePorts: '1' },
    ],
    pricing: { currency: 'USD', perKwh: '0.3', perMinute: '', parkingFee: '' },
    amenities: 'Cafe, Wi-Fi',
    photos: [{ id: 'p1', label: 'Front', gradient: 'linear-gradient(...)' }],
    notes: 'note',
};

const firstError = (values: StationFormValues): string | undefined => {
    const result = stationFormSchema.safeParse(values);
    return result.success ? undefined : result.error.issues[0].message;
};

describe('stationFormSchema', () => {
    it('accepts valid values', () => {
        expect(stationFormSchema.safeParse(validValues).success).toBe(true);
    });

    it('requires a name', () => {
        expect(firstError({ ...validValues, name: '  ' })).toBe(
            'Station name is required.'
        );
    });

    it('requires an address', () => {
        expect(firstError({ ...validValues, address: '' })).toBe(
            'Address is required.'
        );
    });

    it('requires valid lat/lng', () => {
        expect(firstError({ ...validValues, lat: 'abc' })).toBe(
            'Latitude and longitude must be valid numbers.'
        );
        expect(firstError({ ...validValues, lng: '' })).toBe(
            'Latitude and longitude must be valid numbers.'
        );
    });

    it('requires at least one valid connector', () => {
        expect(firstError({ ...validValues, connectors: [] })).toBe(
            'Add at least one valid connector entry.'
        );
        expect(
            firstError({
                ...validValues,
                connectors: [
                    { id: 'c1', type: 'CCS2', powerKW: '0', ports: '2', availablePorts: '1' },
                ],
            })
        ).toBe('Add at least one valid connector entry.');
    });

    it('requires pricing currency and per kWh', () => {
        expect(
            firstError({
                ...validValues,
                pricing: { ...validValues.pricing, perKwh: '' },
            })
        ).toBe('Pricing currency and per kWh are required.');
        expect(
            firstError({
                ...validValues,
                pricing: { ...validValues.pricing, currency: '' },
            })
        ).toBe('Pricing currency and per kWh are required.');
    });
});

describe('buildStationPayload', () => {
    it('coerces drafts into a typed payload', () => {
        const payload = buildStationPayload(validValues);
        expect(payload).toMatchObject({
            name: 'Test Station',
            address: '123 Test St',
            status: 'AVAILABLE',
            lat: 10,
            lng: 20,
            connectors: [{ type: 'CCS2', powerKW: 50, ports: 2, availablePorts: 1 }],
            pricing: { currency: 'USD', perKwh: 0.3 },
            amenities: ['Cafe', 'Wi-Fi'],
            photos: [{ label: 'Front', gradient: 'linear-gradient(...)' }],
            notes: 'note',
        });
        expect(typeof payload.lastUpdatedISO).toBe('string');
    });

    it('clamps availablePorts to ports and drops photos missing label/gradient', () => {
        const payload = buildStationPayload({
            ...validValues,
            connectors: [
                { id: 'c1', type: 'CCS2', powerKW: '50', ports: '2', availablePorts: '5' },
            ],
            photos: [{ id: 'p1', label: 'Front', gradient: '' }],
        });
        expect(payload.connectors[0].availablePorts).toBe(2);
        expect(payload.photos).toEqual([]);
    });

    it('omits empty perMinute/parkingFee and maps blank notes to null', () => {
        const payload = buildStationPayload({
            ...validValues,
            notes: '   ',
            pricing: { ...validValues.pricing, perMinute: '', parkingFee: '' },
        });
        expect(payload.pricing).not.toHaveProperty('perMinute');
        expect(payload.pricing).not.toHaveProperty('parkingFee');
        expect(payload.notes).toBeNull();
    });
});
