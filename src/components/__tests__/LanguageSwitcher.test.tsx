import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import i18n from '../../i18n';
import { LanguageSwitcher } from '..';

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the language trigger button', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByLabelText('Change language')).toBeInTheDocument();
  });

  it('opens a menu listing Indonesia and English', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('switches the app language to Indonesian and localizes its own label', async () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByLabelText('Change language'));
    fireEvent.click(screen.getByText('Indonesia'));

    await waitFor(() => expect(i18n.language).toBe('id'));
    await waitFor(() =>
      expect(screen.getByLabelText('Ubah bahasa')).toBeInTheDocument(),
    );
  });
});
