import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCarPage from '../index';
import * as reduxHooks from '../../../app/hooks';
import { createCarRequest } from '../addCarRoute';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../app/hooks', () => ({ useAppSelector: vi.fn() }));
vi.mock('../addCarRoute', () => ({ createCarRequest: vi.fn() }));

describe('AddCarPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (reduxHooks.useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { email: 'test@test.com', userId: 'user123' } })
        );
    });

    it('renders the page title', () => {
        render(<AddCarPage />);
        expect(screen.getByText('Add a car')).toBeInTheDocument();
    });

    it('blocks submit + shows an error when no connector is selected', async () => {
        render(<AddCarPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));

        await waitFor(() =>
            expect(
                screen.getByText('Select at least one connector type.')
            ).toBeInTheDocument()
        );
        expect(createCarRequest).not.toHaveBeenCalled();
    });

    it('creates the car + navigates on a valid submit', async () => {
        vi.mocked(createCarRequest).mockResolvedValue({ ok: true });
        render(<AddCarPage />);

        fireEvent.click(screen.getByText('Type2'));
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));

        await waitFor(() =>
            expect(createCarRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user123',
                    email: 'test@test.com',
                    connectorTypes: ['Type2'],
                })
            )
        );
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('shows the server error on failure', async () => {
        vi.mocked(createCarRequest).mockResolvedValue({ ok: false, error: 'Server error' });
        render(<AddCarPage />);

        fireEvent.click(screen.getByText('CCS2'));
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));

        await waitFor(() =>
            expect(screen.getByText('Server error')).toBeInTheDocument()
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates back on cancel', () => {
        render(<AddCarPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
});
