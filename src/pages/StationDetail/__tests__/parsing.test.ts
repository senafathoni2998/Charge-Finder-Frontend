import { describe, it, expect, vi } from 'vitest';
import {
    toCleanString,
    toChargingStatus,
    toProgressPercent,
    toChargingSpeed,
    toDateMs,
    isVehicleCharging,
    buildChargingSocketUrl,
    buildTicketFromServer,
} from '../parsing';

describe('toCleanString', () => {
    it('trims strings, stringifies numbers, and returns "" otherwise', () => {
        expect(toCleanString('  hi ')).toBe('hi');
        expect(toCleanString(42)).toBe('42');
        expect(toCleanString(null)).toBe('');
        expect(toCleanString(undefined)).toBe('');
        expect(toCleanString({})).toBe('');
    });
});

describe('toChargingStatus', () => {
    it('normalizes known statuses, else null', () => {
        expect(toChargingStatus('charging')).toBe('charging');
        expect(toChargingStatus(' DONE ')).toBe('done');
        expect(toChargingStatus('completed')).toBe('done');
        expect(toChargingStatus('idle')).toBe('idle');
        expect(toChargingStatus('weird')).toBeNull();
        expect(toChargingStatus(5)).toBeNull();
    });
});

describe('toProgressPercent', () => {
    it('clamps to 0-100 and rounds', () => {
        expect(toProgressPercent(50.4)).toBe(50);
        expect(toProgressPercent(-10)).toBe(0);
        expect(toProgressPercent(150)).toBe(100);
        expect(toProgressPercent('75')).toBe(75);
        expect(toProgressPercent('abc')).toBeNull();
    });
});

describe('toChargingSpeed', () => {
    it('normalizes speed variants, else null', () => {
        expect(toChargingSpeed('normal')).toBe('NORMAL');
        expect(toChargingSpeed('Fast')).toBe('FAST');
        expect(toChargingSpeed('ultra-fast')).toBe('ULTRA_FAST');
        expect(toChargingSpeed('ULTRAFAST')).toBe('ULTRA_FAST');
        expect(toChargingSpeed('slow')).toBeNull();
        expect(toChargingSpeed(3)).toBeNull();
    });
});

describe('toDateMs', () => {
    it('handles Date, numbers (seconds or ms), and ISO strings', () => {
        const d = new Date('2024-01-01T00:00:00Z');
        expect(toDateMs(d)).toBe(d.getTime());
        expect(toDateMs(1_700_000_000_000)).toBe(1_700_000_000_000);
        expect(toDateMs(1_700_000_000)).toBe(1_700_000_000_000);
        expect(toDateMs('2024-01-01T00:00:00Z')).toBe(
            Date.parse('2024-01-01T00:00:00Z')
        );
        expect(toDateMs('not a date')).toBeNull();
        expect(toDateMs(null)).toBeNull();
    });
});

describe('isVehicleCharging', () => {
    it('is true only when chargingStatus is CHARGING', () => {
        expect(isVehicleCharging({ chargingStatus: 'CHARGING' })).toBe(true);
        expect(isVehicleCharging({ chargingStatus: ' charging ' })).toBe(true);
        expect(isVehicleCharging({ chargingStatus: 'idle' })).toBe(false);
        expect(isVehicleCharging({})).toBe(false);
    });
});

describe('buildChargingSocketUrl', () => {
    it('builds a wss URL from an https backend', () => {
        vi.stubEnv('VITE_APP_BACKEND_URL', 'https://api.example.com');
        expect(buildChargingSocketUrl('st-1')).toBe(
            'wss://api.example.com/ws/charging-progress?stationId=st-1'
        );
        vi.unstubAllEnvs();
    });

    it('builds a ws URL from an http backend', () => {
        vi.stubEnv('VITE_APP_BACKEND_URL', 'http://localhost:5000');
        expect(buildChargingSocketUrl('st-1')).toBe(
            'ws://localhost:5000/ws/charging-progress?stationId=st-1'
        );
        vi.unstubAllEnvs();
    });
});

describe('buildTicketFromServer', () => {
    it('maps a server payload to a Ticket', () => {
        const ticket = buildTicketFromServer(
            {
                id: 'T1',
                status: 'PAID',
                createdAt: '2024-01-01T00:00:00Z',
                chargingStatus: 'charging',
                progressPercent: 40,
            },
            'IDR 20,000'
        );
        expect(ticket).toMatchObject({
            id: 'T1',
            methodId: 'paid',
            priceLabel: 'IDR 20,000',
            purchasedAt: '2024-01-01T00:00:00Z',
            chargingStatus: 'charging',
            progressPercent: 40,
        });
    });

    it('falls back when fields are missing', () => {
        const ticket = buildTicketFromServer({}, 'X');
        expect(ticket.id).toMatch(/^TICKET-/);
        expect(ticket.methodId).toBe('ticket');
        expect(ticket.priceLabel).toBe('X');
    });
});
