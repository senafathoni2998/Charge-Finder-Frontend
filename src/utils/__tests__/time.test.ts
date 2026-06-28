import { describe, it, expect, vi, afterEach } from 'vitest';
import { minutesAgo } from '../time';

describe('time utils', () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('minutesAgo', () => {
        it('should calculate minutes ago correctly', () => {
             const now = new Date('2023-01-01T12:00:00Z').getTime();
             vi.spyOn(Date, 'now').mockReturnValue(now);

             // 10 minutes ago
             const past = '2023-01-01T11:50:00Z';
             expect(minutesAgo(past)).toBe(10);
        });

        it('should return 0 for future dates (max(0, ...))', () => {
            const now = new Date('2023-01-01T12:00:00Z').getTime();
            vi.spyOn(Date, 'now').mockReturnValue(now);

            const future = '2023-01-01T12:10:00Z';
            expect(minutesAgo(future)).toBe(0);
        });

        it('should return round to nearest minute', () => {
             const now = new Date('2023-01-01T12:00:00Z').getTime();
             vi.spyOn(Date, 'now').mockReturnValue(now);

             // 90 seconds ago = 1.5 minutes -> round to 2? or 1? Math.round(1.5) is 2.
             const past = new Date(now - 90000).toISOString();
             expect(minutesAgo(past)).toBe(2);
        });

        it('should return 0 for missing or malformed timestamps (no "NaNm ago")', () => {
            expect(minutesAgo(undefined as unknown as string)).toBe(0);
            expect(minutesAgo(null as unknown as string)).toBe(0);
            expect(minutesAgo('')).toBe(0);
            expect(minutesAgo('not-a-date')).toBe(0);
        });
    });
});
