import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditCarFormSection from '../EditCarFormSection';
import type { EditCarFormValues } from '../../types';
import type { EditCarFormHandlers } from '../../types';
import type { ConnectorType } from '../../../models/model';

// Mock AddCarFormCard to simplify testing
vi.mock('../../../AddCar/components/AddCarFormCard', () => ({
    default: ({ submitLabel, submittingLabel }: any) => (
        <div data-testid="add-car-form-card">
            <div data-testid="submit-label">{submitLabel}</div>
            <div data-testid="submitting-label">{submittingLabel}</div>
        </div>
    ),
}));

// Mock AddCarHeader
vi.mock('../../../AddCar/components/AddCarHeader', () => ({
    default: ({ title, subtitle }: any) => (
        <div data-testid="add-car-header">
            <div data-testid="title">{title}</div>
            <div data-testid="subtitle">{subtitle}</div>
        </div>
    ),
}));

describe('EditCarFormSection', () => {
    const mockValues: EditCarFormValues = {
        name: 'Tesla Model 3',
        connectors: new Set<ConnectorType>(['Type2', 'CCS2']),
        minKW: 22,
        batteryCapacity: '75',
    };

    const mockHandlers: EditCarFormHandlers = {
        onNameChange: vi.fn(),
        onToggleConnector: vi.fn(),
        onMinKWChange: vi.fn(),
        onBatteryCapacityChange: vi.fn(),
    };

    const defaultProps = {
        values: mockValues,
        handlers: mockHandlers,
        submitError: null,
        isSubmitting: false,
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        userId: 'user123',
        email: 'test@example.com',
        vehicleId: 'car123',
    };

    it('should render EditCarHeader', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('add-car-header')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toHaveTextContent('Edit car');
    });

    it('should render AddCarFormCard', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('add-car-form-card')).toBeInTheDocument();
    });

    it('should pass correct submit label to AddCarFormCard', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('submit-label')).toHaveTextContent('Update car');
    });

    it('should pass correct submitting label to AddCarFormCard', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('submitting-label')).toHaveTextContent('Updating...');
    });

    it('should pass all required props to AddCarFormCard', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('add-car-form-card')).toBeInTheDocument();
        expect(screen.getByTestId('add-car-header')).toBeInTheDocument();
    });

    it('should render subtitle in header', () => {
        render(<EditCarFormSection {...defaultProps} />);

        expect(screen.getByTestId('subtitle')).toHaveTextContent(
            'Update your connector types to keep station matches accurate.'
        );
    });
});
