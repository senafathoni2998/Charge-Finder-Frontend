import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCarActions from '../AddCarActions';

describe('AddCarActions', () => {
    it('should render buttons with default labels', () => {
        render(<AddCarActions isSubmitting={false} onCancel={() => {}} />);
        
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save car' })).toBeInTheDocument();
    });

    it('should render custom labels', () => {
        render(
            <AddCarActions 
                isSubmitting={false} 
                onCancel={() => {}} 
                submitLabel="Create" 
                submittingLabel="Creating..." 
            />
        );
        
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<AddCarActions isSubmitting={true} onCancel={() => {}} />);
        
        const submitBtn = screen.getByRole('button', { name: 'Saving...' });
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
        
        // Cancel should still be enabled (or disabled? UI logic doesn't say, Material UI buttons default enabled usually unless prop passed)
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });

    it('should call onCancel when clicked', () => {
        const mockCancel = vi.fn();
        render(<AddCarActions isSubmitting={false} onCancel={mockCancel} />);
        
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockCancel).toHaveBeenCalled();
    });
});
