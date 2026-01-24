import { describe, it, expect } from 'vitest';
import { buildMapsUrl, getTicketPriceLabel, getSharePayload } from '../utils';
import type { Station } from '../types';

describe('StationDetail utils', () => {
    describe('buildMapsUrl', () => {
        it('should build a Google Maps URL with coordinates', () => {
            const url = buildMapsUrl(-6.2, 106.8167);
            expect(url).toBe('https://www.google.com/maps/search/?api=1&query=-6.2,106.8167');
        });

        it('should build a Google Maps URL with positive coordinates', () => {
            const url = buildMapsUrl(40.7128, -74.006);
            expect(url).toBe('https://www.google.com/maps/search/?api=1&query=40.7128,-74.006');
        });

        it('should build a Google Maps URL with zero coordinates', () => {
            const url = buildMapsUrl(0, 0);
            expect(url).toBe('https://www.google.com/maps/search/?api=1&query=0,0');
        });
    });

    describe('getTicketPriceLabel', () => {
        const mockStation: Station = {
            id: 'st-001',
            name: 'Test Station',
            address: '123 Test St',
            lat: -6.2,
            lng: 106.8167,
            status: 'AVAILABLE',
            connectors: [],
            amenities: [],
            pricing: {
                currency: 'IDR',
                perKwh: 1000,
            },
        };

        it('should return "N/A" when station is null', () => {
            const result = getTicketPriceLabel(null, 20);
            expect(result).toBe('N/A');
        });

        it('should return "—" when perKwh is not finite', () => {
            const stationWithoutPricing: Station = {
                ...mockStation,
                pricing: { currency: 'IDR', perKwh: NaN },
            };
            const result = getTicketPriceLabel(stationWithoutPricing, 20);
            expect(result).toBe('—');
        });

        it('should calculate price correctly for valid station', () => {
            const result = getTicketPriceLabel(mockStation, 20);
            expect(result).toContain('IDR');
            expect(result).toContain('20,000');
        });

        it('should use pricePerKwhOverride when provided', () => {
            const result = getTicketPriceLabel(mockStation, 20, 1500);
            expect(result).toContain('IDR');
            expect(result).toContain('30,000');
        });

        it('should handle zero kWh', () => {
            const result = getTicketPriceLabel(mockStation, 0);
            expect(result).toContain('IDR');
        });

        it('should handle decimal kWh', () => {
            const result = getTicketPriceLabel(mockStation, 15.5);
            expect(result).toContain('IDR');
            expect(result).toContain('15,500');
        });
    });

    describe('getSharePayload', () => {
        const mockStation: Station = {
            id: 'st-001',
            name: 'Test Station',
            address: '123 Test St',
            lat: -6.2,
            lng: 106.8167,
            status: 'AVAILABLE',
            connectors: [],
            amenities: [],
            pricing: {
                currency: 'IDR',
                perKwh: 1000,
            },
        };

        it('should build share payload with title, text, and url', () => {
            const result = getSharePayload(mockStation);
            expect(result).toEqual({
                title: 'Test Station',
                text: 'Test Station — 123 Test St',
                url: 'https://www.google.com/maps/search/?api=1&query=-6.2,106.8167',
            });
        });

        it('should handle special characters in station name', () => {
            const stationWithSpecialChars: Station = {
                ...mockStation,
                name: 'Station & Café',
            };
            const result = getSharePayload(stationWithSpecialChars);
            expect(result.title).toBe('Station & Café');
        });

        it('should handle empty address', () => {
            const stationWithEmptyAddress: Station = {
                ...mockStation,
                address: '',
            };
            const result = getSharePayload(stationWithEmptyAddress);
            expect(result.text).toBe('Test Station — ');
        });
    });
});
