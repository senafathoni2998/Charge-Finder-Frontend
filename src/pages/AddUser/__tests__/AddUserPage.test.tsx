import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserPage from '../index';
import * as router from 'react-router';

vi.mock('../components/AddUserFormCard', () => ({
    default: ({ values, handlers, onSubmit, submitError }: any) => (
        <form data-testid="user-form" onSubmit={onSubmit}>
            <input 
                aria-label="Name" 
                value={values.name} 
                onChange={e => handlers.onNameChange(e.target.value)} 
            />
            <input 
                aria-label="Email" 
                value={values.email} 
                onChange={e => handlers.onEmailChange(e.target.value)} 
            />
            <input 
                aria-label="Password" 
                value={values.password} 
                onChange={e => handlers.onPasswordChange(e.target.value)} 
            />
            <input 
                aria-label="Region" 
                value={values.region} 
                onChange={e => handlers.onRegionChange(e.target.value)} 
            />
            <div data-testid="submit-error">{submitError}</div>
            <button type="submit">Create</button>
        </form>
    ),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useActionData: vi.fn(),
        useNavigation: vi.fn(),
    };
});

describe('AddUserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (router.useNavigate as any).mockReturnValue(vi.fn());
        (router.useNavigation as any).mockReturnValue({ state: 'idle' });
        (router.useActionData as any).mockReturnValue(undefined);
    });

    it('should validate name', () => {
        render(<AddUserPage />);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'A' } }); // Short
        fireEvent.click(screen.getByText('Create'));
        expect(screen.getByTestId('submit-error')).toHaveTextContent('Name must be');
    });

    it('should validate email', () => {
        render(<AddUserPage />);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Valid Name' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid' } });
        fireEvent.click(screen.getByText('Create'));
        expect(screen.getByTestId('submit-error')).toHaveTextContent('valid email');
    });

    it('should validate region', () => {
        render(<AddUserPage />);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Valid Name' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'validate@email.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
        // Region is empty by default
        fireEvent.click(screen.getByText('Create'));
        expect(screen.getByTestId('submit-error')).toHaveTextContent('Region is required');
    });

    it('should display server error', () => {
        (router.useActionData as any).mockReturnValue({ error: 'Email taken' });
        render(<AddUserPage />);
        expect(screen.getByTestId('submit-error')).toHaveTextContent('Email taken');
    });
});
