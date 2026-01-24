import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { createMemoryRouter } from 'react-router';
import LoginFormCard from '../LoginFormCard';

// Wrapper to provide router context
function createWrapper() {
    const router = createMemoryRouter([
        {
            path: '/',
            element: (
                <LoginFormCard
                    values={{
                        email: 'test@example.com',
                        password: 'password123',
                    }}
                    handlers={{
                        onEmailChange: vi.fn(),
                        onPasswordChange: vi.fn(),
                    }}
                    error={null}
                    onDismissError={vi.fn()}
                    onSubmit={vi.fn()}
                    pwIssue={null}
                    isSubmitting={false}
                    onForgotPassword={vi.fn()}
                    onNavigateToSignup={vi.fn()}
                />
            ),
        },
    ]);

    return { router };
}

describe('LoginFormCard', () => {
    it('should render the login card', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to access your car profile and tickets.')).toBeInTheDocument();
    });

    it('should render email input with correct value', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        const emailInput = screen.getByLabelText('Email');
        expect(emailInput).toHaveValue('test@example.com');
    });

    it('should render password input with correct value', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveValue('password123');
    });

    it('should show error alert when error is provided', () => {
        const router = createMemoryRouter([
            {
                path: '/',
                element: (
                    <LoginFormCard
                        values={{ email: '', password: '' }}
                        handlers={{
                            onEmailChange: vi.fn(),
                            onPasswordChange: vi.fn(),
                        }}
                        error="Invalid credentials"
                        onDismissError={vi.fn()}
                        onSubmit={vi.fn()}
                        pwIssue={null}
                        isSubmitting={false}
                        onForgotPassword={vi.fn()}
                        onNavigateToSignup={vi.fn()}
                    />
                ),
            },
        ]);

        render(<RouterProvider router={router} />);
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should not show error alert when error is null', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show password issue as helper text when present', () => {
        const router = createMemoryRouter([
            {
                path: '/',
                element: (
                    <LoginFormCard
                        values={{ email: '', password: '' }}
                        handlers={{
                            onEmailChange: vi.fn(),
                            onPasswordChange: vi.fn(),
                        }}
                        error={null}
                        onDismissError={vi.fn()}
                        onSubmit={vi.fn()}
                        pwIssue="Password is too short"
                        isSubmitting={false}
                        onForgotPassword={vi.fn()}
                        onNavigateToSignup={vi.fn()}
                    />
                ),
            },
        ]);

        render(<RouterProvider router={router} />);
        expect(screen.getByText('Password is too short')).toBeInTheDocument();
    });

    it('should render "New here?" text', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        expect(screen.getByText(/New here?/)).toBeInTheDocument();
    });

    it('should render terms and privacy text', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        expect(screen.getByText(/By signing in, you agree to the demo Terms and Privacy./)).toBeInTheDocument();
    });

    it('should render "Remember me" checkbox', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    });

    it('should toggle password visibility when eye icon is clicked', () => {
        const { router } = createWrapper();
        render(<RouterProvider router={router} />);

        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButtons = screen.getAllByRole('button');
        const showButton = toggleButtons.find(btn => btn.getAttribute('aria-label') === 'Show password');
        expect(showButton).toBeInTheDocument();

        if (showButton) {
            fireEvent.click(showButton);
            expect(passwordInput).toHaveAttribute('type', 'text');
        }
    });
});
