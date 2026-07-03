import { describe, it, expect } from 'vitest';
import type { TFunction } from 'i18next';
import {
    getPaymentMethods,
    getReportIssueTypes,
    TICKET_KWH,
    TOTAL_CHARGE_MINUTES,
} from '../constants';

// Fake translator that returns the exact English strings so the assertions can
// keep verifying the display text produced by the getters.
const EN: Record<string, string> = {
    'constants.payment.cardLabel': 'Card - Visa **** 4242',
    'constants.payment.cardHelper': 'Instant approval',
    'constants.payment.ewalletLabel': 'E-Wallet - GoPay',
    'constants.payment.ewalletHelper': 'Balance required',
    'constants.payment.bankLabel': 'Bank transfer - BCA',
    'constants.payment.bankHelper': 'May take 1-3 min',
    'constants.report.brokenConnector': 'Broken connector',
    'constants.report.occupied': 'Occupied but shown available',
    'constants.report.paymentProblem': 'Payment problem',
    'constants.report.stationOffline': 'Station offline',
    'constants.report.other': 'Other',
};

const t = ((key: string) => EN[key] ?? key) as unknown as TFunction;

describe('StationDetail constants', () => {
    it('defines payment methods in order', () => {
        const paymentMethods = getPaymentMethods(t);
        expect(paymentMethods).toHaveLength(3);
        expect(paymentMethods[0]).toMatchObject({
            id: 'card',
            label: 'Card - Visa **** 4242',
            helper: 'Instant approval',
        });
        expect(paymentMethods[1]).toMatchObject({
            id: 'ewallet',
            label: 'E-Wallet - GoPay',
            helper: 'Balance required',
        });
        expect(paymentMethods[2]).toMatchObject({
            id: 'bank',
            label: 'Bank transfer - BCA',
            helper: 'May take 1-3 min',
        });
    });

    it('defines report issue types', () => {
        expect(getReportIssueTypes(t)).toEqual([
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
