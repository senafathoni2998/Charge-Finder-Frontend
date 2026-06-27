import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditStationFormSection from '../EditStationFormSection';
import type { StationFormValues } from '../../../../forms/schemas';

// Mock the heavy form card; assert the section wires the right props into it.
vi.mock('../../../AddStation/components/StationFormCard', () => ({
    default: ({ submitLabel, submittingLabel, connectorOptions, defaultValues }: any) => (
        <div data-testid="station-form-card">
            <div data-testid="submit-label">{submitLabel}</div>
            <div data-testid="submitting-label">{submittingLabel}</div>
            <div data-testid="connector-options">{connectorOptions?.join(',')}</div>
            <div data-testid="default-name">{defaultValues?.name}</div>
        </div>
    ),
}));

const defaultValues: StationFormValues = {
    name: 'Test Station',
    address: '123 Test St',
    status: 'AVAILABLE',
    lat: '50',
    lng: '10',
    connectors: [
        { id: 'c1', type: 'CCS2', powerKW: '50', ports: '2', availablePorts: '1' },
    ],
    pricing: { currency: 'IDR', perKwh: '10000', perMinute: '', parkingFee: '' },
    amenities: '',
    photos: [],
    notes: '',
};

const props = {
    defaultValues,
    serverError: null,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
};

describe('EditStationFormSection', () => {
    it('renders the edit-station header', () => {
        render(<EditStationFormSection {...props} />);
        expect(screen.getByText('Edit station')).toBeInTheDocument();
    });

    it('passes update labels + defaults + connector options to the form card', () => {
        render(<EditStationFormSection {...props} />);
        expect(screen.getByTestId('submit-label')).toHaveTextContent('Update station');
        expect(screen.getByTestId('submitting-label')).toHaveTextContent('Updating...');
        expect(screen.getByTestId('default-name')).toHaveTextContent('Test Station');
        expect(screen.getByTestId('connector-options')).toHaveTextContent(
            'CCS2,Type2,CHAdeMO'
        );
    });
});
