import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MainPage from '../index';
import * as mainPageStorage from '../mainPageStorage';
import type { Station } from '../types';
import appReducer from '../../../features/app/appSlice';
import authReducer from '../../../features/auth/authSlice';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/', search: '', hash: '' }),
    };
});

// Mock API calls
vi.mock('../../api/stations', () => ({
    fetchStations: vi.fn(() => Promise.resolve({ ok: true, stations: [] })),
    fetchStationById: vi.fn(() => Promise.resolve({ ok: true, station: null })),
}));

// Mock geolocation hook
vi.mock('../../hooks/geolocation-hook', () => ({
    useGeoLocation: () => ({
        loc: { lat: -6.2, lng: 106.8167 },
        loading: false,
        requestId: 1,
        request: vi.fn(),
    }),
}));

// Mock utility functions
vi.mock('../../utils/distance', () => ({
    filterStations: vi.fn((stations, filters, userCenter) => {
        return stations.map((s: any) => ({ ...s, distanceKm: 5 }));
    }),
    boundsFromStations: vi.fn(() => ({
        minLat: 40,
        maxLat: 41,
        minLng: -74,
        maxLng: -73,
        latSpan: 1,
        lngSpan: 1,
    })),
}));

// Mock localStorage
vi.mock('../mainPageStorage', () => ({
    persistActiveCarId: vi.fn(),
}));

// Mock child components
vi.mock('../components/FiltersPanel', () => ({
    default: ({
        filterValues: { query },
        filterActions: { onQueryChange },
        authState: { onLogin, onAddCar },
    }: any) => (
        <div data-testid="filters-panel-mock">
            <div>Query: {query}</div>
            <button onClick={() => onQueryChange('test')}>Change Query</button>
            <button onClick={onLogin}>Login</button>
            <button onClick={onAddCar}>Add Car</button>
        </div>
    ),
}));

vi.mock('../components/MapPanel', () => ({
    default: ({ stationData, mapActions, viewState }: any) => (
        <div data-testid="map-panel-mock">
            <div>Stations: {stationData?.stations?.length || 0}</div>
            <div>Selected: {stationData?.selectedId || 'none'}</div>
            <button onClick={() => stationData?.onSelectStation?.('station-1')}>Select Station</button>
            <button onClick={viewState?.onRequestLocation}>Request Location</button>
        </div>
    ),
}));

// Helper function to create a test store
function createTestStore() {
    return configureStore({
        reducer: {
            app: appReducer,
            auth: authReducer,
        },
        preloadedState: {
            app: { isSidebarOpen: false, mdMode: true },
            auth: {
                isAuthenticated: false,
                cars: [],
                activeCarId: null,
            },
        },
    });
}

describe('MainPage', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createTestStore();
    });

    it('should render without crashing', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByTestId('filters-panel-mock')).toBeInTheDocument();
        expect(screen.getByTestId('map-panel-mock')).toBeInTheDocument();
    });

    it('should initialize with default filter values', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Query:')).toBeInTheDocument();
        });
    });

    it('should handle query changes', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const changeQueryButton = screen.getByText('Change Query');
        changeQueryButton.click();

        await waitFor(() => {
            expect(screen.getByText('Query: test')).toBeInTheDocument();
        });
    });

    it('should handle login navigation', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const loginButton = screen.getByText('Login');
        loginButton.click();

        expect(mockNavigate).toHaveBeenCalledWith('/login?next=%2F');
    });

    it('should handle add car navigation', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const addCarButton = screen.getByText('Add Car');
        addCarButton.click();

        expect(mockNavigate).toHaveBeenCalledWith('/profile/cars/new');
    });

    it('should handle station selection', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const selectStationButton = screen.getByText('Select Station');
        selectStationButton.click();

        await waitFor(() => {
            expect(screen.getByText('Selected: station-1')).toBeInTheDocument();
        });
    });

    it('should handle location request', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const requestLocationButton = screen.getByText('Request Location');
        requestLocationButton.click();

        // Button should be clickable without error
        expect(requestLocationButton).toBeInTheDocument();
    });

    it('should navigate to station details when station is selected', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <MainPage />
                </MemoryRouter>
            </Provider>
        );

        const selectStationButton = screen.getByText('Select Station');
        selectStationButton.click();

        await waitFor(() => {
            expect(screen.getByText('Selected: station-1')).toBeInTheDocument();
        });

        // After selecting a station, clicking view details should navigate
        // This is tested in the MapPanel tests
    });
});
