import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ChargeFinderLoginPage from '../index';
import * as loginStorage from '../loginStorage';
import * as sessionUtils from '../../../utils/session';
import * as loginUtils from '../loginUtils';
import { loginRequest } from '../loginRoute';

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

// Mock child components
vi.mock('../components/LoginAppBar', () => ({
    default: ({ onNavigateHome }: any) => (
        <div data-testid="login-app-bar">
            <button onClick={onNavigateHome}>Home</button>
        </div>
    ),
}));

vi.mock('../components/LoginBackground', () => ({
    default: () => <div data-testid="login-background" />,
}));

// The card owns the form now; the page passes default values + the submit handler.
vi.mock('../components/LoginFormCard', () => ({
    default: ({
        defaultEmail,
        defaultPassword,
        serverError,
        onDismissError,
        onSubmit,
        onForgotPassword,
        onNavigateToSignup,
    }: any) => (
        <div data-testid="login-form-card">
            <input data-testid="email" defaultValue={defaultEmail} readOnly />
            <input data-testid="password" defaultValue={defaultPassword} readOnly />
            {serverError && <div data-testid="error">{serverError}</div>}
            <button onClick={onDismissError}>Dismiss Error</button>
            <button
                onClick={() =>
                    onSubmit({ email: defaultEmail, password: defaultPassword }, true)
                }
            >
                Submit
            </button>
            <button onClick={onForgotPassword}>Forgot Password</button>
            <button onClick={onNavigateToSignup}>Sign Up</button>
        </div>
    ),
}));

vi.mock('../loginRoute', () => ({
    loginRequest: vi.fn(),
}));

vi.mock('../loginStorage', () => ({
    getRememberedLoginEmail: vi.fn(() => null),
}));

vi.mock('../loginUtils', () => ({
    safeNextPath: vi.fn((path: string | null) => path || '/'),
}));

vi.mock('../../../utils/session', () => ({
    consumeSessionMessage: vi.fn(() => null),
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <ChargeFinderLoginPage />
        </MemoryRouter>
    );

describe('ChargeFinderLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
        vi.mocked(loginStorage.getRememberedLoginEmail).mockReturnValue(null);
    });

    it('should render the login page', () => {
        renderPage();
        expect(screen.getByTestId('login-app-bar')).toBeInTheDocument();
        expect(screen.getByTestId('login-background')).toBeInTheDocument();
        expect(screen.getByTestId('login-form-card')).toBeInTheDocument();
    });

    it('should default to the demo email when there is no remembered email', () => {
        renderPage();
        expect(screen.getByTestId('email')).toHaveValue('demo@chargefinder.com');
    });

    it('should default to the demo password', () => {
        renderPage();
        expect(screen.getByTestId('password')).toHaveValue('demo123');
    });

    it('should use the remembered email when present', () => {
        vi.mocked(loginStorage.getRememberedLoginEmail).mockReturnValue(
            'remembered@example.com'
        );
        renderPage();
        expect(screen.getByTestId('email')).toHaveValue('remembered@example.com');
    });

    it('should navigate home when the home button is clicked', () => {
        renderPage();
        fireEvent.click(screen.getByText('Home'));
        expect(mockUseNavigate).toHaveBeenCalledWith('/');
    });

    it('should show a toast when forgot password is clicked', () => {
        renderPage();
        fireEvent.click(screen.getByText('Forgot Password'));
        expect(
            screen.getByText('Forgot password (demo). Wire to reset flow.')
        ).toBeInTheDocument();
    });

    it('should navigate to signup forwarding the next param', () => {
        mockUseSearchParams.mockReturnValue([
            new URLSearchParams('?next=/admin'),
            vi.fn(),
        ]);
        vi.mocked(loginUtils.safeNextPath).mockReturnValue('/admin');

        renderPage();
        fireEvent.click(screen.getByText('Sign Up'));
        expect(mockUseNavigate).toHaveBeenCalledWith('/signup?next=%2Fadmin');
    });

    it('should consume the session message on mount', () => {
        renderPage();
        expect(sessionUtils.consumeSessionMessage).toHaveBeenCalled();
    });

    it('should navigate to the next path after a successful login', async () => {
        mockUseSearchParams.mockReturnValue([
            new URLSearchParams('?next=/admin'),
            vi.fn(),
        ]);
        vi.mocked(loginUtils.safeNextPath).mockReturnValue('/admin');
        vi.mocked(loginRequest).mockResolvedValue({ ok: true });

        renderPage();
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() =>
            expect(loginRequest).toHaveBeenCalledWith({
                email: 'demo@chargefinder.com',
                password: 'demo123',
                remember: true,
            })
        );
        expect(mockUseNavigate).toHaveBeenCalledWith('/admin');
    });

    it('should show the server error when login fails', async () => {
        vi.mocked(loginRequest).mockResolvedValue({
            ok: false,
            error: 'Invalid email or password.',
        });

        renderPage();
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() =>
            expect(screen.getByTestId('error')).toHaveTextContent(
                'Invalid email or password.'
            )
        );
        expect(mockUseNavigate).not.toHaveBeenCalled();
    });
});
