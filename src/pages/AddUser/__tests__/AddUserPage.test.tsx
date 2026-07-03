import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddUserPage from '../index';
import { createUserRequest } from '../addUserRoute';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const VALUES = {
    name: 'Valid Name',
    email: 'test@test.com',
    role: 'user',
    password: 'Password123!',
    region: 'Jakarta',
};

vi.mock('../components/AddUserFormCard', () => ({
    default: ({ serverError, onSubmit, onCancel }: any) => (
        <div>
            <button onClick={() => onSubmit(VALUES)}>Create</button>
            <button onClick={onCancel}>Cancel</button>
            <div data-testid="submit-error">{serverError}</div>
        </div>
    ),
}));

vi.mock('../addUserRoute', () => ({
    createUserRequest: vi.fn(),
}));

describe('AddUserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates the user and navigates to /admin on success', async () => {
        vi.mocked(createUserRequest).mockResolvedValue({ ok: true });

        render(<AddUserPage />);
        fireEvent.click(screen.getByText('Create'));

        await waitFor(() =>
            expect(createUserRequest).toHaveBeenCalledWith(
                VALUES,
                'Could not add user.'
            )
        );
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('shows the server error on failure', async () => {
        vi.mocked(createUserRequest).mockResolvedValue({
            ok: false,
            error: 'Email taken',
        });

        render(<AddUserPage />);
        fireEvent.click(screen.getByText('Create'));

        await waitFor(() =>
            expect(screen.getByTestId('submit-error')).toHaveTextContent(
                'Email taken'
            )
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to /admin on cancel', () => {
        render(<AddUserPage />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
});
