import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCarFormCard from '../AddCarFormCard';
import type { ConnectorType } from '../../../../models/model';

// Mock React Router Form
vi.mock('react-router', async () => {
    return {
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={onSubmit} {...props}>{children}</form>
        ),
    };
});

describe('AddCarFormCard', () => {
    const mockHandlers = {
            onNameChange: vi.fn(),
            onToggleConnector: vi.fn(),
            onMinKWChange: vi.fn(),
            onBatteryCapacityChange: vi.fn(),
    };
    const mockSubmit = vi.fn((e) => e.preventDefault());
    const mockCancel = vi.fn();
    const baseProps = {
        values: { name: '', connectors: new Set<ConnectorType>(), minKW: 0, batteryCapacity: '' },
        handlers: mockHandlers,
        connectorOptions: ['Type2', 'CCS2'] as ConnectorType[],
        submitError: null,
        isSubmitting: false,
        onSubmit: mockSubmit,
        onCancel: mockCancel,
        userId: 'user1',
        email: 'user@test.com',
        minPower: { min: 0, max: 200, step: 10 },
    };

    it('should render form fields correctly', () => {
        render(<AddCarFormCard {...baseProps} />);
        
        expect(screen.getByLabelText('Car name')).toBeInTheDocument();
        expect(screen.getByLabelText('Battery capacity (kWh)')).toBeInTheDocument();
        expect(screen.getByText('Connector types')).toBeInTheDocument();
        expect(screen.getByText('Preferred minimum power')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save car' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should handle field changes', () => {
        render(<AddCarFormCard {...baseProps} />);
        
        const nameInput = screen.getByLabelText('Car name');
        fireEvent.change(nameInput, { target: { value: 'Test Car' } });
        expect(mockHandlers.onNameChange).toHaveBeenCalledWith('Test Car');

        const battInput = screen.getByLabelText('Battery capacity (kWh)');
        fireEvent.change(battInput, { target: { value: '80' } });
        expect(mockHandlers.onBatteryCapacityChange).toHaveBeenCalledWith('80');
    });

    it('should submit form', () => {
        render(<AddCarFormCard {...baseProps} />);
        
        const saveBtn = screen.getByRole('button', { name: 'Save car' });
        fireEvent.click(saveBtn); // Button inside form with type="submit" triggers submit
        expect(mockSubmit).toHaveBeenCalled();
    });

    it('should show error alert if provided', () => {
        render(<AddCarFormCard {...baseProps} submitError="Something went wrong" />);
        // Wait, AddCarFormCard passes error to ConnectorTypePicker? 
        // Or renders it somewhere?
        // AddCarFormCard.tsx:112: error={submitError} -> passed to ConnectorTypePicker
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should populate hidden fields', () => {
        render(<AddCarFormCard {...baseProps} userId="u1" email="e1" />);
        
        // Hidden inputs are hard to query by role, use selectors
        // Or checking container
        const form = screen.getByLabelText('Car name').closest('form');
        expect(form).toHaveFormValues({ userId: 'u1', email: 'e1' });
    });
});
