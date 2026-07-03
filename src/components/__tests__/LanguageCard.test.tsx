import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import i18n from '../../i18n';
import { LanguageCard } from '..';

describe('LanguageCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('shows the language title and both language options', () => {
    render(<LanguageCard />);
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Indonesia' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  it('marks the current language as selected', () => {
    render(<LanguageCard />);
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches to Indonesian and localizes the card title', async () => {
    render(<LanguageCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Indonesia' }));

    await waitFor(() => expect(i18n.language).toBe('id'));
    await waitFor(() =>
      expect(screen.getByText('Bahasa')).toBeInTheDocument(),
    );
  });
});
