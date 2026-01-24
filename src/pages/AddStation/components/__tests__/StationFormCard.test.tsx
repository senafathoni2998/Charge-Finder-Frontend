import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import StationFormCard, { StationFormValues } from '../StationFormCard';
import type { ConnectorType } from '../../../../models/model';

// Mock Form
vi.mock('react-router', async () => {
    return {
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={onSubmit} {...props}>{children}</form>
        ),
    };
});

// Mock LocationPickerMap (it's heavy)
vi.mock('../LocationPickerMap', () => ({
    default: ({ onPick }: any) => (
        <div data-testid="location-picker" onClick={() => onPick?.(1.23, 4.56)}>
            Map
        </div>
    ),
}));

describe('StationFormCard', () => {
    // Basic setup
    const initialValues: StationFormValues = {
        name: '', address: '', status: 'AVAILABLE', lat: '', lng: '',
        connectors: [], pricing: { currency: 'IDR', perKwh: '', perMinute: '', parkingFee: '' },
        amenities: '', photos: [], notes: ''
    };
    
    const mockHandlers = {
        onNameChange: vi.fn(), onAddressChange: vi.fn(), onStatusChange: vi.fn(),
        onLatChange: vi.fn(), onLngChange: vi.fn(), onConnectorChange: vi.fn(),
        onAddConnector: vi.fn(), onRemoveConnector: vi.fn(), onPricingChange: vi.fn(),
        onAmenitiesChange: vi.fn(), onPhotoChange: vi.fn(), onAddPhoto: vi.fn(),
        onRemovePhoto: vi.fn(), onNotesChange: vi.fn(),
    };
    
    const mockSubmit = vi.fn((e) => e.preventDefault());
    const mockCancel = vi.fn();

    const baseProps = {
        values: initialValues,
        handlers: mockHandlers,
        connectorOptions: ['Type2'] as ConnectorType[],
        submitError: null,
        isSubmitting: false,
        onSubmit: mockSubmit,
        onCancel: mockCancel,
    };

    it('should render basic fields', () => {
        render(<StationFormCard {...baseProps} />);
        
        expect(screen.getByLabelText('Station name')).toBeInTheDocument();
        expect(screen.getByLabelText('Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('should handle basic inputs', () => {
        render(<StationFormCard {...baseProps} />);
        
        fireEvent.change(screen.getByLabelText('Station name'), { target: { value: 'My Station' } });
        expect(mockHandlers.onNameChange).toHaveBeenCalledWith('My Station');
    });

    it('should handle location picker', () => {
        render(<StationFormCard {...baseProps} />);
        
        // Mock Map
        fireEvent.click(screen.getByTestId('location-picker'));
        expect(mockHandlers.onLatChange).toHaveBeenCalledWith('1.230000');
        expect(mockHandlers.onLngChange).toHaveBeenCalledWith('4.560000');
    });

    it('should render connectors', () => {
        const connectors: any[] = [{ id: 'c1', type: 'Type2', powerKW: '50', ports: '2', availablePorts: '1' }];
        render(<StationFormCard {...baseProps} values={{...initialValues, connectors}} />);
        
        expect(screen.getByText('Connector 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Power (kW)')).toHaveValue(50);
    });

    it('should call add connector', () => {
        render(<StationFormCard {...baseProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Add connector' }));
        expect(mockHandlers.onAddConnector).toHaveBeenCalled();
    });

    it('should render photos', () => {
        const photos: any[] = [{ id: 'p1', label: 'Front', gradient: 'red' }];
        render(<StationFormCard {...baseProps} values={{...initialValues, photos}} />);
        
        expect(screen.getByText('Photo')).toBeInTheDocument();
        expect(screen.getByLabelText('Label')).toHaveValue('Front');
    });

    it('should submit form', () => {
        render(<StationFormCard {...baseProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Save station' }));
        expect(mockSubmit).toHaveBeenCalled();
    });
});
