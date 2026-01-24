import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EditStationPage from '../index';
import type { Station } from '../../../../models/model';

// Mock the react-router module
const mockUseActionData = vi.fn(() => undefined);
const mockUseNavigate = vi.fn();
const mockUseNavigation = vi.fn(() => ({ state: 'idle' }));
const mockUseParams = vi.fn(() => ({ stationId: 's1' }));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useActionData: () => mockUseActionData(),
        useNavigate: () => mockUseNavigate,
        useNavigation: () => mockUseNavigation(),
        useParams: () => mockUseParams(),
    };
});

// Mock child components
vi.mock('../components/EditStationFormSection', () => ({
    default: ({ values }: any) => (
        <div data-testid="edit-station-form-section">
            <div data-testid="station-name">{values.name}</div>
        </div>
    ),
}));

vi.mock('../components/EditStationNotFoundState', () => ({
    default: ({ errorMessage, onBack }: any) => (
        <div data-testid="edit-station-not-found">
            <div>{errorMessage || 'Station not found.'}</div>
            <button onClick={onBack}>Back to admin</button>
        </div>
    ),
}));

vi.mock('../components/EditStationLoadingState', () => ({
    default: () => <div data-testid="edit-station-loading">Loading...</div>,
}));

vi.mock('../components/EditStationLayout', () => ({
    default: ({ children }: any) => (
        <div data-testid="edit-station-layout">{children}</div>
    ),
}));

const mockUseEditStationLoader = vi.fn((stationId: string) => ({
    station: null,
    loading: false,
    error: null,
}));

vi.mock('../hooks/useEditStationLoader', () => ({
    default: (stationId: string) => mockUseEditStationLoader(stationId),
}));

const mockUseEditStationFormState = vi.fn((station: Station | null, defaultConnectorType: string) => ({
    values: {
        name: 'Test Station',
        address: '123 Test St',
        status: 'AVAILABLE',
        lat: '50',
        lng: '10',
        connectors: [],
        pricing: { currency: 'IDR', perKwh: '10000', perMinute: '', parkingFee: '' },
        amenities: '',
        photos: [],
        notes: '',
    },
    handlers: {
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
    },
    onSubmit: vi.fn(),
    formError: null,
    locationCenter: { lat: 50, lng: 10 },
    onRequestLocation: vi.fn(),
    onPickLocation: vi.fn(),
    addressLookupLoading: false,
    locationLoading: false,
    locationError: null,
}));

vi.mock('../hooks/useEditStationFormState', () => ({
    default: (station: Station | null, defaultConnectorType: string) => mockUseEditStationFormState(station, defaultConnectorType),
}));

vi.mock('../../AddStation/components/LocationPickerMap', () => ({
    default: () => <div data-testid="location-picker-map" />,
}));

const mockStation: Station = {
    id: 's1',
    name: 'Test Station',
    address: '123 Test St',
    status: 'AVAILABLE',
    lat: 50,
    lng: 10,
    connectors: [],
    photos: [],
    pricing: { currency: 'IDR', perKwh: 10000 },
    lastUpdatedISO: '2025-01-24T10:00:00Z',
};

describe('EditStationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseParams.mockReturnValue({ stationId: 's1' });
        mockUseNavigate.mockReturnValue(vi.fn() as any);
        mockUseNavigation.mockReturnValue({ state: 'idle' });
    });

    it('should render loading state when loading', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: null,
            loading: true,
            error: null,
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('edit-station-loading')).toBeInTheDocument();
    });

    it('should render not found state when station is null and not loading', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: null,
            loading: false,
            error: 'Station not found.',
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('edit-station-not-found')).toBeInTheDocument();
        expect(screen.getByText('Station not found.')).toBeInTheDocument();
    });

    it('should render form section when station is loaded', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: mockStation,
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('edit-station-form-section')).toBeInTheDocument();
        expect(screen.getByTestId('station-name')).toHaveTextContent('Test Station');
    });

    it('should render EditStationLayout wrapper', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: mockStation,
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('edit-station-layout')).toBeInTheDocument();
    });

    it('should useEditStationLoader with stationId from params', () => {
        mockUseParams.mockReturnValue({ stationId: 's1' });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(mockUseEditStationLoader).toHaveBeenCalledWith('s1');
    });

    it('should useEditStationFormState with station and default connector type', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: mockStation,
            loading: false,
            error: null,
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(mockUseEditStationFormState).toHaveBeenCalledWith(mockStation, 'CCS2');
    });

    it('should show error message from loader', () => {
        mockUseEditStationLoader.mockReturnValue({
            station: null,
            loading: false,
            error: 'Failed to load station',
        });

        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Failed to load station')).toBeInTheDocument();
    });
});
