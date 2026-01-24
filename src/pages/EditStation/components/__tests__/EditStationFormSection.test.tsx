import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditStationFormSection from '../EditStationFormSection';
import type { StationFormValues } from '../../../AddStation/components/StationFormCard';
import type { EditStationFormHandlers } from '../../types';
import type { ConnectorType } from '../../../../models/model';

// Mock StationFormCard and StationHeader
vi.mock('../../../AddStation/components/StationFormCard', () => ({
    StationFormCard: ({ submitLabel, submittingLabel }: any) => (
        <div data-testid="station-form-card">
            <div data-testid="submit-label">{submitLabel}</div>
            <div data-testid="submitting-label">{submittingLabel}</div>
        </div>
    ),
    default: ({ submitLabel, submittingLabel, connectorOptions }: any) => (
        <div data-testid="station-form-card">
            <div data-testid="submit-label">{submitLabel}</div>
            <div data-testid="submitting-label">{submittingLabel}</div>
            <div data-testid="connector-options">{connectorOptions?.join(',')}</div>
        </div>
    ),
}));

vi.mock('../../../AddStation/components/StationHeader', () => ({
    default: ({ title, subtitle }: any) => (
        <div data-testid="station-header">
            <div data-testid="title">{title}</div>
            <div data-testid="subtitle">{subtitle}</div>
        </div>
    ),
}));

vi.mock('../../../AddStation/components/LocationPickerMap', () => ({
    default: () => <div data-testid="location-picker-map" />,
}));

vi.mock('../../MainPage/constants', () => ({
    CONNECTOR_OPTIONS: ['CCS2', 'Type2', 'CHAdeMO'],
}));

describe('EditStationFormSection', () => {
    const mockValues: StationFormValues = {
        name: 'Test Station',
        address: '123 Test St',
        status: 'AVAILABLE',
        lat: '50',
        lng: '10',
        connectors: [],
        pricing: {
            currency: 'IDR',
            perKwh: '10000',
            perMinute: '',
            parkingFee: '',
        },
        amenities: '',
        photos: [],
        notes: '',
    };

    const mockHandlers: EditStationFormHandlers = {
        onNameChange: vi.fn(),
        onAddressChange: vi.fn(),
        onStatusChange: vi.fn(),
        onLatChange: vi.fn(),
        onLngChange: vi.fn(),
        onConnectorChange: vi.fn(),
        onAddConnector: vi.fn(),
        onRemoveConnector: vi.fn(),
        onPricingChange: vi.fn(),
        onAmenitiesChange: vi.fn(),
        onPhotoChange: vi.fn(),
        onAddPhoto: vi.fn(),
        onRemovePhoto: vi.fn(),
        onNotesChange: vi.fn(),
    };

    const defaultProps = {
        values: mockValues,
        handlers: mockHandlers,
        submitError: null,
        isSubmitting: false,
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        stationId: 's1',
        locationCenter: { lat: 50, lng: 10 },
        onRequestLocation: vi.fn(),
        onPickLocation: vi.fn(),
        locationLoading: false,
        addressLookupLoading: false,
        locationError: null,
    };

    it('should render EditStationHeader', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('station-header')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toHaveTextContent('Edit station');
    });

    it('should render StationFormCard', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('station-form-card')).toBeInTheDocument();
    });

    it('should pass correct submit label to StationFormCard', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('submit-label')).toHaveTextContent('Update station');
    });

    it('should pass correct submitting label to StationFormCard', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('submitting-label')).toHaveTextContent('Updating...');
    });

    it('should pass all required props to StationFormCard', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('station-form-card')).toBeInTheDocument();
    });

    it('should render default subtitle in header', () => {
        render(<EditStationFormSection {...defaultProps} />);

        expect(screen.getByTestId('subtitle')).toHaveTextContent(
            'Update station details and keep the network accurate.'
        );
    });
});
