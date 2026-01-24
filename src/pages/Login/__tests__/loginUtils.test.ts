import { describe, it, expect } from 'vitest';
import { safeNextPath } from '../loginUtils';

describe('loginUtils', () => {
    describe('safeNextPath', () => {
        it('should return "/" when next is null', () => {
            expect(safeNextPath(null)).toBe('/');
        });

        it('should return "/" when next is empty string', () => {
            expect(safeNextPath('')).toBe('/');
        });

        it('should return "/" when next does not start with "/"', () => {
            expect(safeNextPath('https://evil.com')).toBe('/');
        });

        it('should return "/" when next starts with "/login"', () => {
            expect(safeNextPath('/login')).toBe('/');
            expect(safeNextPath('/login?redirect=true')).toBe('/');
        });

        it('should return the original path when it starts with "/" and not "/login"', () => {
            expect(safeNextPath('/admin')).toBe('/admin');
            expect(safeNextPath('/profile')).toBe('/profile');
            expect(safeNextPath('/stations')).toBe('/stations');
        });

        it('should return "/" when next is just "/"', () => {
            expect(safeNextPath('/')).toBe('/');
        });

        it('should handle paths with query parameters', () => {
            expect(safeNextPath('/admin?tab=stations')).toBe('/admin?tab=stations');
            expect(safeNextPath('/profile?edit=true')).toBe('/profile?edit=true');
        });

        it('should prevent login redirect loops', () => {
            expect(safeNextPath('/login')).toBe('/');
            expect(safeNextPath('/login/')).toBe('/');
            expect(safeNextPath('/login?next=/admin')).toBe('/');
        });
    });
});
