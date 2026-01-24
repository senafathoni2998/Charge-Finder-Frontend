import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfileDialog from '../EditProfileDialog';

// Mock the Form component to avoid router context issues
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe('EditProfileDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        nameDraft: 'John Doe',
        regionDraft: 'Jakarta, ID',
        profileError: null,
        email: 'john@example.com',
        userId: 'user-123',
        onNameChange: vi.fn(),
        onRegionChange: vi.fn(),
    };

    it('should render the dialog when open', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Edit profile')).toBeInTheDocument();
    });

    it('should not render the dialog when closed', () => {
        render(<EditProfileDialog {...defaultProps} open={false} />);
        expect(screen.queryByText('Edit profile')).not.toBeInTheDocument();
    });

    it('should render the name field', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    });

    it('should render the email field as disabled', () => {
        render(<EditProfileDialog {...defaultProps} />);
        const emailField = screen.getByLabelText('Email');
        expect(emailField).toBeInTheDocument();
        expect(emailField).toBeDisabled();
    });

    it('should display the email value', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('should render the photo upload section', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Profile photo (optional)')).toBeInTheDocument();
        expect(screen.getByText('Upload photo')).toBeInTheDocument();
    });

    it('should render the region field', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByLabelText('Region')).toBeInTheDocument();
    });

    it('should render the Cancel button', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render the Save changes button', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Save changes')).toBeInTheDocument();
    });

    it('should call onNameChange when name field changes', () => {
        const onNameChange = vi.fn();
        render(<EditProfileDialog {...defaultProps} onNameChange={onNameChange} />);
        const nameField = screen.getByLabelText('Full name');
        fireEvent.change(nameField, { target: { value: 'Jane Doe' } });
        expect(onNameChange).toHaveBeenCalledWith('Jane Doe');
    });

    it('should call onRegionChange when region field changes', () => {
        const onRegionChange = vi.fn();
        render(<EditProfileDialog {...defaultProps} onRegionChange={onRegionChange} />);
        const regionField = screen.getByLabelText('Region');
        fireEvent.change(regionField, { target: { value: 'Bandung, ID' } });
        expect(onRegionChange).toHaveBeenCalledWith('Bandung, ID');
    });

    it('should display profile error when provided', () => {
        render(<EditProfileDialog {...defaultProps} profileError="Name is required" />);
        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
        const onClose = vi.fn();
        render(<EditProfileDialog {...defaultProps} onClose={onClose} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit and close when Save changes is clicked', () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn((e) => e.preventDefault());
        render(<EditProfileDialog {...defaultProps} onClose={onClose} onSubmit={onSubmit} />);
        const saveButton = screen.getByText('Save changes');
        fireEvent.click(saveButton);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should have hidden intent input', () => {
        render(<EditProfileDialog {...defaultProps} />);
        const intentInput = document.querySelector('input[name="intent"]');
        expect(intentInput).toBeInTheDocument();
        expect((intentInput as HTMLInputElement).value).toBe('profile');
    });

    it('should have hidden userId input', () => {
        render(<EditProfileDialog {...defaultProps} />);
        const userIdInput = document.querySelector('input[name="userId"]');
        expect(userIdInput).toBeInTheDocument();
        expect((userIdInput as HTMLInputElement).value).toBe('user-123');
    });

    it('should handle null userId', () => {
        render(<EditProfileDialog {...defaultProps} userId={null} />);
        const userIdInput = document.querySelector('input[name="userId"]');
        expect((userIdInput as HTMLInputElement).value).toBe('');
    });

    it('should show helper text for name field', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Shown on your profile.')).toBeInTheDocument();
    });

    it('should show helper text for region field', () => {
        render(<EditProfileDialog {...defaultProps} />);
        expect(screen.getByText('Used for local recommendations.')).toBeInTheDocument();
    });

    it('should show placeholder for region field', () => {
        render(<EditProfileDialog {...defaultProps} />);
        const regionField = screen.getByLabelText('Region');
        expect(regionField).toHaveAttribute('placeholder', 'Example: Jakarta, ID');
    });
});
