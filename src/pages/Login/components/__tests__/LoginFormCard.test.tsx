import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginFormCard from '../LoginFormCard';

type Overrides = Partial<React.ComponentProps<typeof LoginFormCard>>;

function renderCard(overrides: Overrides = {}) {
    const props = {
        defaultEmail: 'test@example.com',
        defaultPassword: 'password123',
        serverError: null,
        onDismissError: vi.fn(),
        onSubmit: vi.fn(),
        onForgotPassword: vi.fn(),
        onNavigateToSignup: vi.fn(),
        ...overrides,
    };
    render(<LoginFormCard {...props} />);
    return props;
}

describe('LoginFormCard', () => {
    it('should render the login card', () => {
        renderCard();
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(
            screen.getByText('Sign in to access your car profile and tickets.')
        ).toBeInTheDocument();
    });

    it('should render email input with the default value', () => {
        renderCard();
        expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    });

    it('should render password input with the default value', () => {
        renderCard();
        expect(screen.getByLabelText('Password')).toHaveValue('password123');
    });

    it('should show the server error alert when provided', () => {
        renderCard({ serverError: 'Invalid credentials' });
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should not show an error alert when serverError is null', () => {
        renderCard();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should call onDismissError when the alert close button is clicked', () => {
        const props = renderCard({ serverError: 'Invalid credentials' });
        fireEvent.click(screen.getByLabelText('Close'));
        expect(props.onDismissError).toHaveBeenCalled();
    });

    it('should render "New here?" text', () => {
        renderCard();
        expect(screen.getByText(/New here?/)).toBeInTheDocument();
    });

    it('should render terms and privacy text', () => {
        renderCard();
        expect(
            screen.getByText(/By signing in, you agree to the demo Terms and Privacy./)
        ).toBeInTheDocument();
    });

    it('should render the "Remember me" checkbox', () => {
        renderCard();
        expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    });

    it('should toggle password visibility when the eye icon is clicked', () => {
        renderCard();
        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(screen.getByLabelText('Show password'));
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should call onForgotPassword when the forgot link is clicked', () => {
        const props = renderCard();
        fireEvent.click(screen.getByText('Forgot password?'));
        expect(props.onForgotPassword).toHaveBeenCalled();
    });

    it('should call onNavigateToSignup when the create-account link is clicked', () => {
        const props = renderCard();
        fireEvent.click(screen.getByText('Create an account'));
        expect(props.onNavigateToSignup).toHaveBeenCalled();
    });

    it('should call onSubmit with the validated values + remember flag on a valid submit', async () => {
        const props = renderCard();
        fireEvent.click(screen.getByText('Sign in'));

        await waitFor(() =>
            expect(props.onSubmit).toHaveBeenCalledWith(
                { email: 'test@example.com', password: 'password123' },
                true
            )
        );
    });

    it('should block submit and show a validation error for an invalid email', async () => {
        const props = renderCard({ defaultEmail: 'not-an-email' });
        fireEvent.click(screen.getByText('Sign in'));

        await waitFor(() =>
            expect(screen.getByText('Example: name@email.com')).toBeInTheDocument()
        );
        expect(props.onSubmit).not.toHaveBeenCalled();
    });
});
