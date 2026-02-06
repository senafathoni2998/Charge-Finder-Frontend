import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StationDetailPage from '../index';
import appReducer from '../../../features/app/appSlice';
import authReducer from '../../../features/auth/authSlice';
import type { Station } from '../types';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseLocation = vi.fn(() => ({
    pathname: '/stations/station-1',
    search: '',
    hash: '',
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockUseLocation(),
        useParams: () => mockUseParams(),
    };
});

const mockFetchStations = vi.fn();
const mockFetchStationById = vi.fn();
vi.mock('../../../api/stations', () => ({
    fetchStations: (...args: any[]) => mockFetchStations(...args),
    fetchStationById: (...args: any[]) => mockFetchStationById(...args),
}));

const mockStartChargingSession = vi.fn();
const mockCancelChargingSession = vi.fn();
const mockCompleteChargingSession = vi.fn();
vi.mock('../../../api/charging', () => ({
    startChargingSession: (...args: any[]) => mockStartChargingSession(...args),
    cancelChargingSession: (...args: any[]) => mockCancelChargingSession(...args),
    completeChargingSession: (...args: any[]) => mockCompleteChargingSession(...args),
}));

const mockRequestChargingTicket = vi.fn();
const mockFetchActiveTicketForStation = vi.fn();
vi.mock('../../../api/tickets', () => ({
    requestChargingTicket: (...args: any[]) => mockRequestChargingTicket(...args),
    fetchActiveTicketForStation: (...args: any[]) => mockFetchActiveTicketForStation(...args),
}));

vi.mock('../../../hooks/geolocation-hook', () => ({
    useGeoLocation: () => ({
        loc: { lat: -6.2, lng: 106.8167 },
        loading: false,
        requestId: 1,
        request: vi.fn(),
    }),
}));

const mockHaversineKm = vi.fn(() => 7.4);
vi.mock('../../../utils/distance', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../utils/distance')>();
    return {
        ...actual,
        haversineKm: (...args: any[]) => mockHaversineKm(...args),
    };
});

const mockCheckSessionStatus = vi.fn(() => ({ status: 'valid', message: null }));
vi.mock('../../../utils/session', () => ({
    checkSessionStatus: (...args: any[]) => mockCheckSessionStatus(...args),
}));

const mockClearAuthStorage = vi.fn();
const mockPersistCarsToStorage = vi.fn();
vi.mock('../../Profile/profileStorage', () => ({
    clearAuthStorage: (...args: any[]) => mockClearAuthStorage(...args),
    persistCarsToStorage: (...args: any[]) => mockPersistCarsToStorage(...args),
}));

vi.mock('../components/StationOverviewSection', () => ({
    default: ({ station, onReportIssue }: any) => (
        <div data-testid="station-overview">
            <div>{station?.name ?? 'No station'}</div>
            <button onClick={onReportIssue}>Report issue</button>
        </div>
    ),
}));

vi.mock('../components/ConnectorsSection', () => ({
    default: () => <div data-testid="connectors-section">Connectors</div>,
}));

vi.mock('../components/AmenitiesSection', () => ({
    default: () => <div data-testid="amenities-section">Amenities</div>,
}));

vi.mock('../components/ActionsCard', () => ({
    default: ({ onChargingAction, onOpenMaps }: any) => (
        <div data-testid="actions-card">
            <button onClick={onChargingAction}>Charging action</button>
            <button onClick={onOpenMaps}>Open maps</button>
        </div>
    ),
}));

vi.mock('../components/PricingSection', () => ({
    default: ({ onPaymentOpen, paymentActionLabel }: any) => (
        <div data-testid="pricing-section">
            <div>{paymentActionLabel}</div>
            <button onClick={onPaymentOpen}>Open payment</button>
        </div>
    ),
}));

vi.mock('../components/CoordinatesSection', () => ({
    default: () => <div data-testid="coordinates-section">Coordinates</div>,
}));

vi.mock('../components/PaymentDialog', () => ({
    default: ({ dialogState }: any) =>
        dialogState?.open ? (
            <div data-testid="payment-dialog">
                <button onClick={dialogState.onClose}>Close payment</button>
            </div>
        ) : null,
}));

vi.mock('../components/ChargingDialog', () => ({
    default: ({ dialogState }: any) =>
        dialogState?.open ? (
            <div data-testid="charging-dialog">
                <button onClick={dialogState.onClose}>Close charging</button>
            </div>
        ) : null,
}));

vi.mock('../components/StartChargingDialog', () => ({
    default: ({ open, onClose }: any) =>
        open ? (
            <div data-testid="start-charging-dialog">
                <button onClick={onClose}>Close start charging</button>
            </div>
        ) : null,
}));

vi.mock('../components/ReportDialog', () => ({
    default: ({ open, onClose }: any) =>
        open ? (
            <div data-testid="report-dialog">
                <button onClick={onClose}>Close report</button>
            </div>
        ) : null,
}));

vi.mock('../components/ShareDialog', () => ({
    default: ({ open, onClose }: any) =>
        open ? (
            <div data-testid="share-dialog">
                <button onClick={onClose}>Close share</button>
            </div>
        ) : null,
}));

const mockStation: Station = {
    id: 'station-1',
    name: 'Test Station',
    lat: 40.7128,
    lng: -74.006,
    address: '123 Test St',
    status: 'AVAILABLE',
    lastUpdatedISO: '2024-01-01T00:00:00Z',
    connectors: [{ type: 'CCS2', powerKW: 50, ports: 2, availablePorts: 1 }],
    photos: [],
    pricing: {
        currency: 'USD',
        perKwh: 0.3,
    },
    amenities: ['Cafe'],
};

class MockWebSocket {
    url: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: (() => void) | null = null;
    close = vi.fn();

    constructor(url: string) {
        this.url = url;
    }
}

const baseAuthState = {
    isAuthenticated: true,
    email: 'test@example.com',
    userId: 'user-1',
    name: 'Test User',
    region: 'Test Region',
    role: null,
    cars: [],
    activeCarId: null,
};

const createTestStore = (authOverrides: Partial<typeof baseAuthState> = {}) =>
    configureStore({
        reducer: {
            app: appReducer,
            auth: authReducer,
        },
        preloadedState: {
            app: {
                isSidebarOpen: false,
                isMdMode: false,
            },
            auth: {
                ...baseAuthState,
                ...authOverrides,
            },
        },
    });

const renderPage = (store: ReturnType<typeof createTestStore>) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <StationDetailPage />
            </MemoryRouter>
        </Provider>
    );

let originalWebSocket: typeof WebSocket | undefined;

describe('StationDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        originalWebSocket = globalThis.WebSocket;
        globalThis.WebSocket = MockWebSocket as any;
        mockUseParams.mockReturnValue({ id: 'station-1' });
        mockUseLocation.mockReturnValue({
            pathname: '/stations/station-1',
            search: '',
            hash: '',
        });
        mockFetchStations.mockResolvedValue({ ok: true, stations: [mockStation] });
        mockFetchStationById.mockResolvedValue({ ok: true, station: mockStation });
        mockFetchActiveTicketForStation.mockResolvedValue({ ok: true, ticket: null });
        mockRequestChargingTicket.mockResolvedValue({ ok: true, ticket: null });
        mockStartChargingSession.mockResolvedValue({ ok: true, ticket: null });
        mockCancelChargingSession.mockResolvedValue({ ok: true, ticket: null });
        mockCompleteChargingSession.mockResolvedValue({ ok: true, ticket: null });
        mockCheckSessionStatus.mockReturnValue({ status: 'valid', message: null });
    });

    afterEach(() => {
        globalThis.WebSocket = originalWebSocket as any;
    });

    it('shows unavailable state when station id is missing', async () => {
        mockUseParams.mockReturnValue({ id: undefined });

        const store = createTestStore({ isAuthenticated: false });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByText('Station unavailable')).toBeInTheDocument();
        });
        expect(screen.getByText('Station ID is missing.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Back to map' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('renders sections after station load', async () => {
        const store = createTestStore({ isAuthenticated: false });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByTestId('station-overview')).toBeInTheDocument();
        });
        expect(screen.getByText('Test Station')).toBeInTheDocument();
        expect(screen.getByTestId('connectors-section')).toBeInTheDocument();
        expect(screen.getByTestId('amenities-section')).toBeInTheDocument();
        expect(screen.getByTestId('actions-card')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
        expect(screen.getByTestId('coordinates-section')).toBeInTheDocument();
    });

    it('opens report dialog when report action is triggered', async () => {
        const store = createTestStore({ isAuthenticated: false });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByTestId('station-overview')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Report issue'));
        expect(screen.getByTestId('report-dialog')).toBeInTheDocument();
    });

    it('opens payment dialog for authenticated users', async () => {
        const store = createTestStore({ isAuthenticated: true });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Open payment'));
        await waitFor(() => {
            expect(screen.getByTestId('payment-dialog')).toBeInTheDocument();
        });
    });

    it('redirects to login when payment action is used while signed out', async () => {
        const store = createTestStore({ isAuthenticated: false });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Open payment'));
        expect(mockNavigate).toHaveBeenCalledWith('/login?next=%2Fstations%2Fstation-1');
        expect(screen.queryByTestId('payment-dialog')).not.toBeInTheDocument();
    });

    it('opens start charging dialog when charging action is triggered', async () => {
        const store = createTestStore({ isAuthenticated: true });
        renderPage(store);

        await waitFor(() => {
            expect(screen.getByTestId('actions-card')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Charging action'));
        expect(screen.getByTestId('start-charging-dialog')).toBeInTheDocument();
    });
});
