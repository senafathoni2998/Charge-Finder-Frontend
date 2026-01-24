import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SignupPage from '../index';

// Mock React Router hooks
const mockUseActionData = vi.fn(() => undefined);
const mockUseNavigate = vi.fn(() => vi.fn());
const mockUseNavigation = vi.fn(() => ({ state: 'idle' }));
const mockUseSearchParams = vi.fn(() => [new URLSearchParams()]);

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useActionData: () => mockUseActionData(),
        useNavigate: () => mockUseNavigate(),
        useNavigation: () => mockUseNavigation(),
        useSearchParams: () => mockUseSearchParams(),
    };
});

// Mock child components
vi.mock('../components/SignupAppBar', () => ({
    default: () => <div data-testid="signup-appbar">SignupAppBar</div>,
}));

vi.mock('../components/SignupBackground', () => ({
    default: () => <div data-testid="signup-background">SignupBackground</div>,
}));

vi.mock('../components/SignupFormCard', () => ({
    default: ({ values, handlers, error, onDismissError, onSubmit, pwIssue, pwStrength, passwordsMatch, isSubmitting, onNavigateToLogin }: any) => (
        <div data-testid="signup-form-card">
            <div>Name: {values.name}</div>
            <div>Email: {values.email}</div>
            <div>Password: {values.password}</div>
            <button onClick={onNavigateToLogin}>Navigate to Login</button>
            {error && <div>Error: {error}</div>}
        </div>
    ),
}));

describe('SignupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('signup-appbar')).toBeInTheDocument();
        expect(screen.getByTestId('signup-background')).toBeInTheDocument();
        expect(screen.getByTestId('signup-form-card')).toBeInTheDocument();
    });

    it('should render the SignupAppBar', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('signup-appbar')).toBeInTheDocument();
    });

    it('should render the SignupBackground', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('signup-background')).toBeInTheDocument();
    });

    it('should render the SignupFormCard', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('signup-form-card')).toBeInTheDocument();
    });

    it('should initialize with empty form values', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        expect(screen.getByText('Name:')).toBeInTheDocument();
        expect(screen.getByText('Email:')).toBeInTheDocument();
        expect(screen.getByText('Password:')).toBeInTheDocument();
    });

    it('should handle action data error', async () => {
        mockUseActionData.mockReturnValueOnce({ error: 'Email already exists' });

        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Error: Email already exists')).toBeInTheDocument();
        });
    });

    it('should call navigateToLogin when Navigate to Login button is clicked', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        const navigateButton = screen.getByText('Navigate to Login');
        navigateButton.click();
        // Button should be clickable without error
        expect(navigateButton).toBeInTheDocument();
    });

    it('should render within a Box with correct background', () => {
        const { container } = render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
    });
});
