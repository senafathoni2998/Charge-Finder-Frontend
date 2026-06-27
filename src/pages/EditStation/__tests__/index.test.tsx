import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EditStationPage from '../index';
import type { Station } from '../../../models/model';

const mockUseNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ stationId: 's1' }));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>(
        'react-router'
    );
    return {
        ...actual,
        useNavigate: () => mockUseNavigate,
        useParams: () => mockUseParams(),
    };
});

vi.mock('../components/EditStationFormSection', () => ({
    default: ({ defaultValues }: any) => (
        <div data-testid="edit-station-form-section">
            <div data-testid="station-name">{defaultValues.name}</div>
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

const mockUseEditStationLoader = vi.fn(() => ({
    station: null as Station | null,
    loading: false,
    error: null as string | null,
}));

vi.mock('../hooks/useEditStationLoader', () => ({
    default: (stationId: string) => mockUseEditStationLoader(stationId),
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
    });

    it('renders the loading state', () => {
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

    it('renders the not-found state', () => {
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

    it('renders the form section with station-derived defaults when loaded', () => {
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

    it('wraps content in EditStationLayout', () => {
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

    it('loads the station by the route param', () => {
        render(
            <MemoryRouter>
                <EditStationPage />
            </MemoryRouter>
        );
        expect(mockUseEditStationLoader).toHaveBeenCalledWith('s1');
    });

    it('shows the loader error message', () => {
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
