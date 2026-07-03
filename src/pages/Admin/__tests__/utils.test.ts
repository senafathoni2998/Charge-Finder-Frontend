import { describe, it, expect, vi } from 'vitest';
import type { TFunction } from 'i18next';
import { normalizeAdminUser, nextStatusForUser, userActionLabel, statusChipStyles, roleChipStyles, userStatusChipStyles } from '../utils';

// Mock time utility if needed, but integration is fine for simple helpers.
// If normalizeAdminUser depends on it for lastActive formatting.

// Fake translator that maps the admin action keys back to their English label
// and echoes any other key, so the display-string helpers stay testable.
const t = ((key: string) => {
    const map: Record<string, string> = {
        'users.actions.suspend': 'Suspend',
        'users.actions.activate': 'Activate',
        'users.actions.approve': 'Approve',
    };
    return map[key] ?? key;
}) as unknown as TFunction;

describe('Admin utils', () => {
    describe('normalizeAdminUser', () => {
        it('should return null for invalid input', () => {
            expect(normalizeAdminUser(t, null)).toBeNull();
            expect(normalizeAdminUser(t, 123)).toBeNull();
            expect(normalizeAdminUser(t, {})).toBeNull(); // No ID
        });

        it('should normalize valid user data', () => {
            const input = {
                id: 'u1',
                email: 'test@test.com',
                name: 'Test User',
                role: 'ADMIN',
                status: 'ACTIVE',
                lastActive: new Date().toISOString()
            };
            
            const result = normalizeAdminUser(t, input);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('Test User');
            expect(result?.role).toBe('admin'); // Lowercased
            expect(result?.status).toBe('active');
        });

        it('should handle missing name by using email', () => {
             const input = { id: 'u1', email: 'john.doe@test.com' };
             const result = normalizeAdminUser(t, input);
             expect(result?.name).toBe('john doe');
        });

        it('should normalize nested or alternative fields', () => {
            // Test mapping of _id, mail, roles array etc
            const input = {
                _id: 'u2',
                mail: 'test@test.com',
                roles: ['user'],
                isActive: true
            };
            const result = normalizeAdminUser(t, input);
            expect(result?.id).toBe('u2');
            expect(result?.role).toBe('user');
            expect(result?.status).toBe('active');
        });
    });

    describe('nextStatusForUser', () => {
        it('should toggle status', () => {
            expect(nextStatusForUser('active')).toBe('suspended');
            expect(nextStatusForUser('suspended')).toBe('active');
            expect(nextStatusForUser('pending')).toBe('active'); // Default fallback?
        });
    });

    describe('userActionLabel', () => {
        it('should return correct label', () => {
            expect(userActionLabel(t, 'active')).toBe('Suspend');
            expect(userActionLabel(t, 'suspended')).toBe('Activate');
            expect(userActionLabel(t, 'pending')).toBe('Approve');
        });
    });
    
    describe('styles', () => {
        it('should return objects for styles', () => {
            expect(statusChipStyles('AVAILABLE')).toHaveProperty('color');
            expect(roleChipStyles('admin')).toHaveProperty('color');
            expect(userStatusChipStyles('active')).toHaveProperty('color');
        });
    });
});
