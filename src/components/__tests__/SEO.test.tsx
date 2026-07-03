import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import i18n from '../../i18n';
import { SEO } from '..';

const metaContent = (name: string, isProperty = false) =>
  document
    .querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`)
    ?.getAttribute('content');

describe('SEO', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('applies the English title and meta by default', async () => {
    render(<SEO />);
    await waitFor(() =>
      expect(document.title).toBe(
        'Charge Finder - EV Charging Station Locator | Full-Stack Demo Portfolio Project',
      ),
    );
    expect(metaContent('og:locale', true)).toBe('en_US');
    expect(metaContent('language')).toBe('English');
    expect(metaContent('description')).toContain('full-stack demo web application');
  });

  it('localizes title, description and og:locale for Indonesian', async () => {
    await i18n.changeLanguage('id');
    render(<SEO />);
    await waitFor(() => expect(metaContent('og:locale', true)).toBe('id_ID'));
    expect(document.title).toContain('Pencari Stasiun Pengisian Kendaraan Listrik');
    expect(metaContent('language')).toBe('Indonesian');
    expect(metaContent('description')).toContain('Aplikasi web demo full-stack');
  });

  it('applies a page-provided title with the brand suffix', async () => {
    render(<SEO title="Station Details" />);
    await waitFor(() =>
      expect(document.title).toBe('Station Details | Charge Finder Demo'),
    );
    expect(metaContent('og:title', true)).toBe(
      'Station Details | Charge Finder Demo',
    );
  });

  it('honors the noIndex flag', async () => {
    render(<SEO noIndex />);
    await waitFor(() =>
      expect(metaContent('robots')).toBe('noindex, nofollow'),
    );
  });
});
