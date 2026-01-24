import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCarPage from '../index';
import * as router from 'react-router';
import * as reduxHooks from '../../../app/hooks';

// Mock dependencies
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useActionData: vi.fn(),
        useNavigation: vi.fn(),
         // Mock Form to avoid needing DataRouter context
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={onSubmit} {...props}>{children}</form>
        ),
    };
});

vi.mock('../../../app/hooks', () => ({
    useAppSelector: vi.fn(),
}));

// Mock child components to simplify testing (optional, but integration is better)
// Keeping components real to verify integration, but mocking Form helped.

describe('AddCarPage', () => {
    const mockNavigate = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        (router.useNavigate as any).mockReturnValue(mockNavigate);
        (router.useNavigation as any).mockReturnValue({ state: 'idle' });
        (router.useActionData as any).mockReturnValue(undefined);
        (reduxHooks.useAppSelector as any).mockImplementation((selector: any) => {
            const state = {
                auth: { email: 'test@test.com', userId: 'user123' }
            };
            return selector(state);
        });
    });

    it('should render page title', () => {
        render(<AddCarPage />);
        // Header title
        expect(screen.getByText('Add a car')).toBeInTheDocument();
    });

    it('should show validation error if submitting without connectors', () => {
        render(<AddCarPage />);
        
        // Connectors are empty by default
        const saveBtn = screen.getByRole('button', { name: 'Save car' });
        fireEvent.click(saveBtn); // Triggers form submit -> handleSubmit

        expect(screen.getByText('Select at least one connector type.')).toBeInTheDocument();
    });

    it('should clear validation error when referencing connectors', () => {
        render(<AddCarPage />);
        
        // Trigger error
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));
        expect(screen.getByText('Select at least one connector type.')).toBeInTheDocument();

        // Select a connector
        const type2 = screen.getByText('Type2');
        fireEvent.click(type2);
        
        expect(screen.queryByText('Select at least one connector type.')).not.toBeInTheDocument();
    });

    it('should display action error from router', () => {
        (router.useActionData as any).mockReturnValue({ error: 'Server error' });
        render(<AddCarPage />);
        
        expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    it('should navigate back on cancel', () => {
        render(<AddCarPage />);
        
        const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelBtn);
        
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('should show loading state', () => {
        (router.useNavigation as any).mockReturnValue({ state: 'submitting' });
        render(<AddCarPage />);
        
        expect(screen.getByText('Saving...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });
});
