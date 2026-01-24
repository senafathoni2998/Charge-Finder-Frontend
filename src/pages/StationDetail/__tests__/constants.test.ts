import { describe, it, expect } from 'vitest';
import {
    PAYMENT_METHODS,
    REPORT_ISSUE_TYPES,
    TICKET_KWH,
    TOTAL_CHARGE_MINUTES,
} from '../constants';

describe('StationDetail constants', () => {
    it('defines payment methods in order', () => {
        expect(PAYMENT_METHODS).toHaveLength(3);
        expect(PAYMENT_METHODS[0]).toMatchObject({
            id: 'card',
            label: 'Card - Visa **** 4242',
            helper: 'Instant approval',
        });
        expect(PAYMENT_METHODS[1]).toMatchObject({
            id: 'ewallet',
            label: 'E-Wallet - GoPay',
            helper: 'Balance required',
        });
        expect(PAYMENT_METHODS[2]).toMatchObject({
            id: 'bank',
            label: 'Bank transfer - BCA',
            helper: 'May take 1-3 min',
        });
    });

    it('defines report issue types', () => {
        expect(REPORT_ISSUE_TYPES).toEqual([
            'Broken connector',
            'Occupied but shown available',
            'Payment problem',
            'Station offline',
            'Other',
        ]);
    });

    it('defines ticket defaults', () => {
        expect(TICKET_KWH).toBe(20);
        expect(TOTAL_CHARGE_MINUTES).toBe(0);
    });
});
