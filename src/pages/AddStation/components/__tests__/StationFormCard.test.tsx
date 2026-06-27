import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StationFormCard from '../StationFormCard';
import type { StationFormValues } from '../../../../forms/schemas';
import type { ConnectorType } from '../../../../models/model';

vi.mock('../LocationPickerMap', () => ({
    default: ({ onPick }: any) => (
        <div data-testid="location-picker" onClick={() => onPick?.(1.23, 4.56)}>
            Map
        </div>
    ),
}));

vi.mock('../../../../hooks/geolocation-hook', () => ({
    useGeoLocation: () => ({
        loc: null,
        loading: false,
        error: null,
        request: vi.fn(),
    }),
}));

vi.mock('../../../../api/geocode', () => ({
    reverseGeocode: vi.fn(async () => ({ ok: true, address: 'Resolved' })),
}));

const validDefaults: StationFormValues = {
    name: 'My Station',
    address: '123 St',
    status: 'AVAILABLE',
    lat: '1',
    lng: '2',
    connectors: [
        { id: 'c1', type: 'Type2', powerKW: '50', ports: '2', availablePorts: '1' },
    ],
    pricing: { currency: 'IDR', perKwh: '100', perMinute: '', parkingFee: '' },
    amenities: '',
    photos: [],
    notes: '',
};

const baseProps = {
    connectorOptions: ['CCS2', 'Type2', 'CHAdeMO'] as ConnectorType[],
    defaultConnectorType: 'CCS2' as ConnectorType,
    serverError: null,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
};

const renderCard = (
    overrides?: Partial<StationFormValues>,
    props?: Record<string, unknown>
) =>
    render(
        <StationFormCard
            {...baseProps}
            {...props}
            defaultValues={{ ...validDefaults, ...overrides }}
        />
    );

describe('StationFormCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the basic fields and sections', () => {
        renderCard();
        expect(screen.getByLabelText('Station name')).toBeInTheDocument();
        expect(screen.getByLabelText('Address')).toBeInTheDocument();
        expect(screen.getByText('Basics')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('renders a connector row with its values', () => {
        renderCard();
        expect(screen.getByText('Connector 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Power (kW)')).toHaveValue(50);
    });

    it('appends a connector when "Add connector" is clicked', () => {
        renderCard();
        expect(screen.queryByText('Connector 2')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Add connector' }));
        expect(screen.getByText('Connector 2')).toBeInTheDocument();
    });

    it('appends a photo when "Add photo" is clicked', () => {
        renderCard();
        expect(screen.getByText('No photos added yet.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Add photo' }));
        expect(screen.getByText('Photo')).toBeInTheDocument();
        expect(screen.getByLabelText('Label')).toBeInTheDocument();
    });

    it('sets lat/lng when the map is clicked', async () => {
        renderCard({ lat: '', lng: '' });
        fireEvent.click(screen.getByTestId('location-picker'));
        // waitFor lets the async reverse-geocode side-effect settle inside act().
        await waitFor(() =>
            expect(screen.getByLabelText('Latitude')).toHaveValue(1.23)
        );
        expect(screen.getByLabelText('Longitude')).toHaveValue(4.56);
    });

    it('submits the parsed values when valid', async () => {
        const onSubmit = vi.fn();
        renderCard({}, { onSubmit });
        fireEvent.click(screen.getByRole('button', { name: 'Save station' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onSubmit.mock.calls[0][0]).toMatchObject({
            name: 'My Station',
            lat: '1',
            lng: '2',
        });
    });

    it('blocks submit and shows a validation error when invalid', async () => {
        const onSubmit = vi.fn();
        renderCard({ name: '   ' }, { onSubmit });
        fireEvent.click(screen.getByRole('button', { name: 'Save station' }));
        await waitFor(() =>
            expect(screen.getByText('Station name is required.')).toBeInTheDocument()
        );
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
