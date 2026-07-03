import { describe, it, expect, afterEach } from 'vitest';
import i18n from '..';

describe('i18n configuration', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('resolves to a supported language', () => {
    expect(['en', 'id']).toContain(i18n.resolvedLanguage ?? i18n.language);
  });

  it('returns English strings by default', () => {
    expect(i18n.t('language.title', { ns: 'common' })).toBe('Language');
    expect(i18n.t('titles.profile', { ns: 'nav' })).toBe('Profile');
  });

  it('returns Indonesian strings after switching', async () => {
    await i18n.changeLanguage('id');
    expect(i18n.t('language.title', { ns: 'common' })).toBe('Bahasa');
    expect(i18n.t('titles.profile', { ns: 'nav' })).toBe('Profil');
  });

  it('falls back to English for an unsupported language', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('language.title', { ns: 'common' })).toBe('Language');
  });

  it('keeps the document language attribute in sync', async () => {
    await i18n.changeLanguage('id');
    expect(document.documentElement.lang).toBe('id');
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

// Regression guards for the adversarial-review fixes: subtle strings that tests
// running only in English would not otherwise catch.
describe('localization review fixes', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('localizes the password-strength chip via the strength tone (signup + profile)', async () => {
    await i18n.changeLanguage('id');
    const t = i18n.t.bind(i18n);
    expect(
      t('strength', { ns: 'signup', label: t('strengthLabels.weak', { ns: 'signup' }) }),
    ).toBe('Kekuatan: Lemah');
    expect(
      t('passwordDialog.strength', {
        ns: 'profile',
        label: t('passwordDialog.strengthLabels.strong', { ns: 'profile' }),
      }),
    ).toBe('Kekuatan: Kuat');
  });

  it('localizes route-action and fallback strings', async () => {
    await i18n.changeLanguage('id');
    expect(i18n.t('errors.loginFailed', { ns: 'login' })).toBe('Gagal masuk.');
    expect(i18n.t('errors.backendNotConfigured', { ns: 'login' })).toBe(
      'URL backend belum dikonfigurasi.',
    );
    expect(i18n.t('cars.defaultName', { ns: 'profile' })).toBe('EV Saya');
  });

  it('keeps English byte-identical for the same keys', () => {
    expect(i18n.t('errors.loginFailed', { ns: 'login' })).toBe('Failed to log in.');
    expect(i18n.t('cars.defaultName', { ns: 'profile' })).toBe('My EV');
    expect(i18n.t('strengthLabels.ok', { ns: 'signup' })).toBe('Okay');
  });

  it('localizes route-action / request fallback errors (api namespace)', async () => {
    await i18n.changeLanguage('id');
    expect(i18n.t('session.userMissing', { ns: 'api' })).toBe(
      'Sesi pengguna tidak ditemukan.',
    );
    expect(i18n.t('cars.saveFailed', { ns: 'api' })).toBe(
      'Tidak dapat menyimpan mobil.',
    );
    expect(i18n.t('auth.signupFailed', { ns: 'api' })).toBe('Gagal mendaftar.');
    expect(i18n.t('cars.defaultName', { ns: 'api' })).toBe('EV Saya');
    // English stays byte-identical (route tests assert these).
    await i18n.changeLanguage('en');
    expect(i18n.t('cars.saveFailed', { ns: 'api' })).toBe('Could not save car.');
    expect(i18n.t('users.addFailed', { ns: 'api' })).toBe('Could not add user.');
  });
});
