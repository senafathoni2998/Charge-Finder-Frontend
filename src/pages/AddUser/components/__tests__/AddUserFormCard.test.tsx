import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserFormCard, { AddUserFormValues } from '../AddUserFormCard';

vi.mock('react-router', async () => {
    return {
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={onSubmit} {...props}>{children}</form>
        ),
    };
});

describe('AddUserFormCard', () => {
    const mockHandlers = {
        onNameChange: vi.fn(),
        onEmailChange: vi.fn(),
        onRoleChange: vi.fn(),
        onPasswordChange: vi.fn(),
        onRegionChange: vi.fn(),
    };
    const mockSubmit = vi.fn((e) => e.preventDefault());
    const mockCancel = vi.fn();
    
    const initialValues: AddUserFormValues = {
        name: '', email: '', role: 'user', password: '', region: ''
    };

    const baseProps = {
        values: initialValues,
        handlers: mockHandlers,
        submitError: null,
        isSubmitting: false,
        onSubmit: mockSubmit,
        onCancel: mockCancel,
    };

    it('should render all fields', () => {
        render(<AddUserFormCard {...baseProps} />);
        
        expect(screen.getByLabelText('Full name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument(); // Type password initially
        expect(screen.getByLabelText('Region')).toBeInTheDocument();
    });

    it('should handle input changes', () => {
        render(<AddUserFormCard {...baseProps} />);
        
        fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test' } });
        expect(mockHandlers.onNameChange).toHaveBeenCalledWith('Test');

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
        expect(mockHandlers.onEmailChange).toHaveBeenCalledWith('test@test.com');
    });

    it('should toggle password visibility', () => {
        render(<AddUserFormCard {...baseProps} />);
        
        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveAttribute('type', 'password');
        
        const toggleBtn = screen.getByLabelText('Show password');
        fireEvent.click(toggleBtn);
        
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    });

    it('should show error message', () => {
        render(<AddUserFormCard {...baseProps} submitError="Invalid data" />);
        expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });

    it('should submit form', () => {
        render(<AddUserFormCard {...baseProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Create user' }));
        expect(mockSubmit).toHaveBeenCalled();
    });
});
