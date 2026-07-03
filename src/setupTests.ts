import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Initialize i18next for the whole test run. Components use react-i18next's
// `useTranslation`, which reads from this global instance, so no per-test
// provider wrapper is needed.
import i18n from './i18n';

// Keep every test deterministic in English regardless of the language detector
// or any language a previous test switched to. Tests that assert Indonesian
// strings opt in explicitly via `await i18n.changeLanguage('id')`.
beforeEach(() => {
  if (i18n.language !== 'en') {
    void i18n.changeLanguage('en');
  }
});
