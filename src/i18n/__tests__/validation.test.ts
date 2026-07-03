import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '..';
import { tValidation } from '../validation';

// Bind so `this` is preserved when we pass i18n.t around as a TFunction.
const t = i18n.t.bind(i18n);

describe('tValidation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('returns an empty string for a missing message', () => {
    expect(tValidation(t, undefined)).toBe('');
    expect(tValidation(t, null)).toBe('');
    expect(tValidation(t, '')).toBe('');
  });

  it('returns the exact English message by default', () => {
    expect(tValidation(t, 'Please enter a valid email address.')).toBe(
      'Please enter a valid email address.',
    );
    expect(tValidation(t, 'Password must be at least 7 characters.')).toBe(
      'Password must be at least 7 characters.',
    );
  });

  it('translates a known message to Indonesian after switching', async () => {
    await i18n.changeLanguage('id');
    expect(tValidation(t, 'Please enter a valid email address.')).toBe(
      'Masukkan alamat email yang valid.',
    );
    expect(tValidation(t, 'Passwords do not match.')).toBe(
      'Kata sandi tidak cocok.',
    );
  });

  it('passes unknown messages through unchanged', () => {
    expect(tValidation(t, 'A server error we do not map')).toBe(
      'A server error we do not map',
    );
  });
});
