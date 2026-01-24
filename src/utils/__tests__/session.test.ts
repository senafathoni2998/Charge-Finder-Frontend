import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkSessionStatus, persistSessionMessage, consumeSessionMessage } from '../session';

describe('session utils', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('checkSessionStatus', () => {
        const createToken = (payload: any) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            return `${header}.${body}.signature`;
        };

        it('should return missing status if no token', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
            const result = checkSessionStatus();
            expect(result.status).toBe('missing');
            expect(result.message).toContain('missing');
        });

        it('should return valid if token cannot be decoded (safety fallback)', () => {
             // Code returns valid if payload is null
             const result = checkSessionStatus('invalid.token');
             expect(result.status).toBe('valid');
        });

        it('should return valid if token has no expiry', () => {
             const token = createToken({ sub: '123' });
             const result = checkSessionStatus(token);
             expect(result.status).toBe('valid');
        });

        it('should return expired if token is expired', () => {
            const now = 1000000;
            vi.spyOn(Date, 'now').mockReturnValue(now);
            
            // Expires 1 second ago
            const token = createToken({ exp: (now - 1000) / 1000 });
            
            const result = checkSessionStatus(token);
            expect(result.status).toBe('expired');
            expect(result.message).toContain('expired');
        });

        it('should return valid if token is not expired', () => {
            const now = 1000000;
            vi.spyOn(Date, 'now').mockReturnValue(now);
            
            // Expires in 1 second
            const token = createToken({ exp: (now + 1000) / 1000 });
            
            const result = checkSessionStatus(token);
            expect(result.status).toBe('valid');
        });

        it('should read token from localStorage if not provided', () => {
             const token = createToken({ sub: '123' });
             vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(token);
             
             const result = checkSessionStatus();
             expect(result.status).toBe('valid');
             expect(window.localStorage.getItem).toHaveBeenCalledWith('cf_auth_token');
        });
    });

    describe('persistSessionMessage', () => {
        it('should save message to sessionStorage', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
            persistSessionMessage('Hello');
            expect(setItemSpy).toHaveBeenCalledWith('cf_session_message', 'Hello');
        });

        it('should not save empty message', () => {
             const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
             persistSessionMessage('');
             expect(setItemSpy).not.toHaveBeenCalled();
        });
    });

    describe('consumeSessionMessage', () => {
        it('should return null if no message', () => {
             vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
             expect(consumeSessionMessage()).toBeNull();
        });

        it('should return message and remove it from sessionStorage', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('Hello');
            const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

            expect(consumeSessionMessage()).toBe('Hello');
            expect(removeItemSpy).toHaveBeenCalledWith('cf_session_message');
        });
    });

});
