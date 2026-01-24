import { describe, it, expect } from 'vitest';
import { 
    isValidEmail, 
    isValidName, 
    passwordIssue, 
    strengthLabel, 
    toneChipSx 
} from '../validate';

describe('validate utils', () => {
    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('foo.bar@baz.co.uk')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail(null as any)).toBe(false);
        });
    });

    describe('isValidName', () => {
        it('should return true for valid names (2-50 chars)', () => {
            expect(isValidName('Jo')).toBe(true);
            expect(isValidName('John Doe')).toBe(true);
            expect(isValidName('A'.repeat(50))).toBe(true);
        });

        it('should return false for invalid names', () => {
            expect(isValidName('A')).toBe(false); // too short
            expect(isValidName('A'.repeat(51))).toBe(false); // too long
            expect(isValidName('')).toBe(false);
        });
    });

    describe('passwordIssue', () => {
        it('should return null if password is valid', () => {
            // Needs >= 7 chars and at least one number
            expect(passwordIssue('Password123')).toBeNull();
        });

        it('should return error if too short', () => {
            expect(passwordIssue('123456')).toBe('Password must be at least 7 characters.');
        });

        it('should return error if no digits', () => {
            expect(passwordIssue('PasswordAccess')).toBe('Add at least one number.');
        });
    });

    describe('strengthLabel', () => {
        // Score rules:
        // >= 8 chars: +1
        // lower + upper: +1
        // digit: +1
        // special: +1
        // <=1: Weak, <=2: Ok, >2: Strong

        it('should identify Weak passwords', () => {
            // "short" -> len 5 (0pts), lower (0pts - need both), no digit, no special. Score 0.
            expect(strengthLabel('short').label).toBe('Weak');
            expect(strengthLabel('short').tone).toBe('weak');

             // "longerpassword" -> len 14 (1pt), lower (0), no digit, no special. Score 1.
             expect(strengthLabel('longerpassword').label).toBe('Weak');
        });

        it('should identify Okay passwords', () => {
             // "Password12" -> len 10 (1pt), lower+upper (1pt), digit (1pt). Score 3? Wait.
             // let's trace: "Password12"
             // len >= 8: +1
             // a-z && A-Z: +1
             // \d: +1
             // special: 0
             // Total 3. Expected Strong.
             
             // "pass1" -> len 5 (0), lower (0), digit (1), special (0). Score 1. Weak.
             
             // "Pass1" -> len 5 (0), lower+upper (1), digit (1). Score 2. Okay.
             expect(strengthLabel('Pass1').label).toBe('Okay');
             expect(strengthLabel('Pass1').tone).toBe('ok');
        });

        it('should identify Strong passwords', () => {
            // "Password12" -> Score 3 (see above)
            expect(strengthLabel('Password12').label).toBe('Strong');
            expect(strengthLabel('Password12').tone).toBe('strong');

            // "Complex!" -> len 8 (1), lower+upper (1), no digit, special (1). Score 3.
            expect(strengthLabel('Complex!').label).toBe('Strong');
        });
    });

    describe('toneChipSx', () => {
        it('should return correct styles for tones', () => {
            const weak = toneChipSx('weak');
            expect(weak.backgroundColor).toBe('rgba(244, 67, 54, 0.10)');

            const ok = toneChipSx('ok');
            expect(ok.backgroundColor).toBe('rgba(255, 193, 7, 0.12)');

            const strong = toneChipSx('strong');
            expect(strong.backgroundColor).toBe('rgba(0, 229, 255, 0.12)');
        });
    });
});
