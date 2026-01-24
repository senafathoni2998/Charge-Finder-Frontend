import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChangePasswordDialog from '../ChangePasswordDialog';

// Mock the Form component to avoid router context issues
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe('ChangePasswordDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        onCurrentPasswordChange: vi.fn(),
        onNewPasswordChange: vi.fn(),
        onConfirmPasswordChange: vi.fn(),
        passwordError: null,
        newPwIssue: null,
        newPwStrength: { label: 'Strong', tone: 'strong' },
        userId: 'user-123',
    };

    it('should render the dialog when open', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('should not render the dialog when closed', () => {
        render(<ChangePasswordDialog {...defaultProps} open={false} />);
        expect(screen.queryByText('Change password')).not.toBeInTheDocument();
    });

    it('should render the current password field', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByLabelText('Current password')).toBeInTheDocument();
    });

    it('should render the new password field', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByLabelText('New password')).toBeInTheDocument();
    });

    it('should render the confirm password field', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
    });

    it('should render the Cancel button', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render the Update password button', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByText('Update password')).toBeInTheDocument();
    });

    it('should call onCurrentPasswordChange when current password changes', () => {
        const onCurrentPasswordChange = vi.fn();
        render(<ChangePasswordDialog {...defaultProps} onCurrentPasswordChange={onCurrentPasswordChange} />);
        const currentPasswordField = screen.getByLabelText('Current password');
        fireEvent.change(currentPasswordField, { target: { value: 'oldpass123' } });
        expect(onCurrentPasswordChange).toHaveBeenCalledWith('oldpass123');
    });

    it('should call onNewPasswordChange when new password changes', () => {
        const onNewPasswordChange = vi.fn();
        render(<ChangePasswordDialog {...defaultProps} onNewPasswordChange={onNewPasswordChange} />);
        const newPasswordField = screen.getByLabelText('New password');
        fireEvent.change(newPasswordField, { target: { value: 'newpass123' } });
        expect(onNewPasswordChange).toHaveBeenCalledWith('newpass123');
    });

    it('should call onConfirmPasswordChange when confirm password changes', () => {
        const onConfirmPasswordChange = vi.fn();
        render(<ChangePasswordDialog {...defaultProps} onConfirmPasswordChange={onConfirmPasswordChange} />);
        const confirmPasswordField = screen.getByLabelText('Confirm new password');
        fireEvent.change(confirmPasswordField, { target: { value: 'newpass123' } });
        expect(onConfirmPasswordChange).toHaveBeenCalledWith('newpass123');
    });

    it('should display password error when provided', () => {
        render(<ChangePasswordDialog {...defaultProps} passwordError="Passwords do not match" />);
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should display new password issue when provided', () => {
        render(
            <ChangePasswordDialog
                {...defaultProps}
                newPwIssue="Password must be at least 8 characters"
                newPassword="test"
            />
        );
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    it('should display password strength chip when new password has value', () => {
        render(<ChangePasswordDialog {...defaultProps} newPassword="test123" />);
        expect(screen.getByText('Strength: Strong')).toBeInTheDocument();
    });

    it('should not display password strength chip when new password is empty', () => {
        render(<ChangePasswordDialog {...defaultProps} newPassword="" />);
        expect(screen.queryByText('Strength:')).not.toBeInTheDocument();
    });

    it('should display password requirements hint', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        expect(screen.getByText('Use 8+ characters, letters, and numbers.')).toBeInTheDocument();
    });

    it('should show confirm password error when passwords do not match', () => {
        render(
            <ChangePasswordDialog
                {...defaultProps}
                newPassword="newpass123"
                confirmPassword="differentpass"
            />
        );
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
        const onClose = vi.fn();
        render(<ChangePasswordDialog {...defaultProps} onClose={onClose} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when Update password button is clicked', () => {
        const onSubmit = vi.fn((e) => e.preventDefault());
        render(<ChangePasswordDialog {...defaultProps} onSubmit={onSubmit} />);
        const updateButton = screen.getByText('Update password');
        fireEvent.click(updateButton);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should have hidden intent input', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        const intentInput = document.querySelector('input[name="intent"]');
        expect(intentInput).toBeInTheDocument();
        expect((intentInput as HTMLInputElement).value).toBe('password');
    });

    it('should have hidden userId input', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        const userIdInput = document.querySelector('input[name="userId"]');
        expect(userIdInput).toBeInTheDocument();
        expect((userIdInput as HTMLInputElement).value).toBe('user-123');
    });

    it('should have visibility toggle buttons for password fields', () => {
        render(<ChangePasswordDialog {...defaultProps} />);
        const toggleButtons = document.querySelectorAll('button[aria-label*="password"]');
        expect(toggleButtons.length).toBe(3);
    });

    it('should trim userId value', () => {
        render(<ChangePasswordDialog {...defaultProps} userId="  user-123  " />);
        const userIdInput = document.querySelector('input[name="userId"]');
        expect((userIdInput as HTMLInputElement).value).toBe('user-123');
    });

    it('should handle null userId', () => {
        render(<ChangePasswordDialog {...defaultProps} userId={null} />);
        const userIdInput = document.querySelector('input[name="userId"]');
        expect((userIdInput as HTMLInputElement).value).toBe('');
    });
});
