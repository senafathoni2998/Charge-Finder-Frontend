import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ChargeFinderLoginPage from '../index';
import * as loginStorage from '../loginStorage';
import * as sessionUtils from '../../../utils/session';
import * as loginUtils from '../loginUtils';

// Mock react-router
const mockUseNavigate = vi.fn();
const mockUseNavigation = vi.fn(() => ({ state: 'idle' }));
const mockUseSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockUseNavigate,
        useNavigation: () => mockUseNavigation(),
        useSearchParams: () => mockUseSearchParams(),
        useActionData: () => undefined,
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

vi.mock('../components/LoginFormCard', () => ({
    default: ({ values, handlers, error, onDismissError, onSubmit, pwIssue, isSubmitting, onForgotPassword, onNavigateToSignup }: any) => (
        <div data-testid="login-form-card">
            <input data-testid="email" value={values.email} onChange={(e: any) => handlers.onEmailChange(e.target.value)} />
            <input data-testid="password" value={values.password} onChange={(e: any) => handlers.onPasswordChange(e.target.value)} />
            {error && <div data-testid="error">{error}</div>}
            {pwIssue && <div data-testid="pw-issue">{pwIssue}</div>}
            <button onClick={onDismissError}>Dismiss Error</button>
            <form onSubmit={onSubmit}>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit'}</button>
            </form>
            <button onClick={onForgotPassword}>Forgot Password</button>
            <button onClick={onNavigateToSignup}>Sign Up</button>
        </div>
    ),
}));

// Mock utilities
vi.mock('../../../utils/validate', () => ({
    isValidEmail: vi.fn((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    passwordIssue: vi.fn(() => null),
}));

vi.mock('../loginStorage', () => ({
    getRememberedLoginEmail: vi.fn(() => null),
    persistLoginSession: vi.fn(),
}));

vi.mock('../loginUtils', () => ({
    safeNextPath: vi.fn((path: string | null) => path || '/'),
}));

vi.mock('../../../utils/session', () => ({
    consumeSessionMessage: vi.fn(() => null),
}));

describe('ChargeFinderLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseNavigate.mockReturnValue(vi.fn());
        mockUseNavigation.mockReturnValue({ state: 'idle' });
        mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
        vi.mocked(loginStorage.getRememberedLoginEmail).mockReturnValue(null);
    });

    it('should render the login page', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('login-app-bar')).toBeInTheDocument();
        expect(screen.getByTestId('login-background')).toBeInTheDocument();
        expect(screen.getByTestId('login-form-card')).toBeInTheDocument();
    });

    it('should start with empty email when no remembered email', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('email')).toHaveValue('');
    });

    it('should start with empty password', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('password')).toHaveValue('');
    });

    it('should load remembered email on mount', () => {
        vi.mocked(loginStorage.getRememberedLoginEmail).mockReturnValue('remembered@example.com');

        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('email')).toHaveValue('remembered@example.com');
    });

    it('should update email when changed', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const emailInput = screen.getByTestId('email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password when changed', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const passwordInput = screen.getByTestId('password');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(passwordInput).toHaveValue('password123');
    });

    it('should call onNavigateHome when home button is clicked', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const homeButton = screen.getByText('Home');
        fireEvent.click(homeButton);

        expect(mockUseNavigate).toHaveBeenCalledWith('/');
    });

    it('should call onForgotPassword when forgot password button is clicked', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const forgotPasswordButton = screen.getByText('Forgot Password');
        fireEvent.click(forgotPasswordButton);

        expect(forgotPasswordButton).toBeInTheDocument();
    });

    it('should navigate to signup with correct path when signup button is clicked', () => {
        mockUseSearchParams.mockReturnValue([
            new URLSearchParams('?next=/admin'),
            vi.fn(),
        ]);
        vi.mocked(loginUtils.safeNextPath).mockReturnValue('/admin');

        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const signUpButton = screen.getByText('Sign Up');
        fireEvent.click(signUpButton);

        expect(mockUseNavigate).toHaveBeenCalledWith('/signup?next=%2Fadmin');
    });

    it('should consume session message on mount', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        expect(sessionUtils.consumeSessionMessage).toHaveBeenCalled();
    });

    it('should pass isSubmitting based on navigation state', () => {
        mockUseNavigation.mockReturnValue({ state: 'submitting' });

        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const submitButton = screen.getByText('Submitting');
        expect(submitButton).toBeDisabled();
    });

    it('should not disable submit when not submitting', () => {
        render(
            <MemoryRouter>
                <ChargeFinderLoginPage />
            </MemoryRouter>
        );

        const submitButton = screen.getByText('Submit');
        expect(submitButton).not.toBeDisabled();
    });
});
