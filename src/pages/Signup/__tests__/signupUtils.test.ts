import { describe, it, expect } from 'vitest';
import { safeNextPath } from '../signupUtils';

describe('safeNextPath', () => {
    it('should return "/" for null or undefined next', () => {
        expect(safeNextPath(null)).toBe('/');
        expect(safeNextPath(undefined as any)).toBe('/');
    });

    it('should return "/" for paths starting with "/login"', () => {
        expect(safeNextPath('/login')).toBe('/');
        expect(safeNextPath('/login?next=/profile')).toBe('/');
        expect(safeNextPath('/login/callback')).toBe('/');
    });

    it('should return "/" for paths starting with "/signup"', () => {
        expect(safeNextPath('/signup')).toBe('/');
        expect(safeNextPath('/signup?step=2')).toBe('/');
        expect(safeNextPath('/signup/complete')).toBe('/');
    });

    it('should return "/" for paths not starting with "/"', () => {
        expect(safeNextPath('profile')).toBe('/');
        expect(safeNextPath('https://evil.com')).toBe('/');
        expect(safeNextPath('')).toBe('/');
    });

    it('should return the original path for valid internal routes', () => {
        expect(safeNextPath('/profile')).toBe('/profile');
        expect(safeNextPath('/map?location=jakarta')).toBe('/map?location=jakarta');
        expect(safeNextPath('/settings')).toBe('/settings');
        expect(safeNextPath('/')).toBe('/');
    });

    it('should handle paths with query parameters', () => {
        expect(safeNextPath('/profile?tab=settings')).toBe('/profile?tab=settings');
        expect(safeNextPath('/map?lat=123&lng=456')).toBe('/map?lat=123&lng=456');
    });
});
