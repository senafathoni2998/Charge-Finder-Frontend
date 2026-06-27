import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SignupPage from '../index';
import * as signupUtils from '../signupUtils';
import { signupRequest } from '../signupRoute';

const mockUseNavigate = vi.fn();
const mockUseSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockUseNavigate,
        useSearchParams: () => mockUseSearchParams(),
    };
});

vi.mock('../components/SignupAppBar', () => ({
    default: () => <div data-testid="signup-appbar">SignupAppBar</div>,
}));

vi.mock('../components/SignupBackground', () => ({
    default: () => <div data-testid="signup-background">SignupBackground</div>,
}));

// The card owns the form now; the page passes the submit handler + server error.
vi.mock('../components/SignupFormCard', () => ({
    default: ({ serverError, onDismissError, onSubmit, onNavigateToLogin }: any) => (
        <div data-testid="signup-form-card">
            <button onClick={onNavigateToLogin}>Navigate to Login</button>
            <button
                onClick={() =>
                    onSubmit(
                        {
                            name: 'Test',
                            region: 'JKT',
                            email: 'test@example.com',
                            password: 'password123',
                            confirm: 'password123',
                        },
                        { remember: true, image: null }
                    )
                }
            >
                Submit
            </button>
            {serverError && <div>Error: {serverError}</div>}
            <button onClick={onDismissError}>Dismiss</button>
        </div>
    ),
}));

vi.mock('../signupRoute', () => ({
    signupRequest: vi.fn(),
}));

vi.mock('../signupUtils', () => ({
    safeNextPath: vi.fn((path: string | null) => path || '/'),
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <SignupPage />
        </MemoryRouter>
    );

describe('SignupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    });

    it('should render without crashing', () => {
        renderPage();
        expect(screen.getByTestId('signup-appbar')).toBeInTheDocument();
        expect(screen.getByTestId('signup-background')).toBeInTheDocument();
        expect(screen.getByTestId('signup-form-card')).toBeInTheDocument();
    });

    it('should navigate to login forwarding the next param', () => {
        mockUseSearchParams.mockReturnValue([
            new URLSearchParams('?next=/profile'),
            vi.fn(),
        ]);
        vi.mocked(signupUtils.safeNextPath).mockReturnValue('/profile');

        renderPage();
        fireEvent.click(screen.getByText('Navigate to Login'));
        expect(mockUseNavigate).toHaveBeenCalledWith('/login?next=%2Fprofile');
    });

    it('should navigate to the next path after a successful signup', async () => {
        mockUseSearchParams.mockReturnValue([
            new URLSearchParams('?next=/profile'),
            vi.fn(),
        ]);
        vi.mocked(signupUtils.safeNextPath).mockReturnValue('/profile');
        vi.mocked(signupRequest).mockResolvedValue({ ok: true });

        renderPage();
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() =>
            expect(signupRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                    password: 'password123',
                    remember: true,
                    image: null,
                })
            )
        );
        expect(mockUseNavigate).toHaveBeenCalledWith('/profile');
    });

    it('should show the server error when signup fails', async () => {
        vi.mocked(signupRequest).mockResolvedValue({
            ok: false,
            error: 'Email already exists',
        });

        renderPage();
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() =>
            expect(screen.getByText('Error: Email already exists')).toBeInTheDocument()
        );
        expect(mockUseNavigate).not.toHaveBeenCalled();
    });
});
