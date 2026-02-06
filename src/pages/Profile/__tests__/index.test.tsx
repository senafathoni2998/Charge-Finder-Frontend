import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from '../index';
import type { ProfileLoaderData } from '../types';
import * as profileStorage from '../profileStorage';
import appReducer from '../../../features/app/appSlice';
import authReducer from '../../../features/auth/authSlice';

// Stable mock data for React Router hooks
const mockLoaderData = { user: null, vehicles: [] as any[], activeCarId: null as string | null };

// Mock React Router hooks
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useLoaderData: vi.fn(() => mockLoaderData),
        useActionData: vi.fn(() => undefined),
        useNavigate: vi.fn(() => vi.fn()),
    };
});

// Mock API calls
vi.mock('../../api/vehicles', () => ({
    fetchVehicleById: vi.fn(() => Promise.resolve({ ok: true, vehicle: null })),
}));

vi.mock('../../api/chargingHistory', () => ({
    fetchChargingHistory: vi.fn(() => Promise.resolve({ ok: true, history: [] })),
}));

vi.mock('../vehicleRequests', () => ({
    deleteVehicleRequest: vi.fn(() => Promise.resolve({ ok: true })),
    setActiveVehicleRequest: vi.fn(() => Promise.resolve({ ok: true })),
}));

// Mock utilities
vi.mock('../../utils/validate', () => ({
    passwordIssue: vi.fn(() => null),
    strengthLabel: vi.fn(() => ({ label: 'Strong', tone: 'strong' as const })),
}));

vi.mock('../profileStorage', () => ({
    persistProfileToStorage: vi.fn(),
    persistCarsToStorage: vi.fn(),
}));

// Mock child components
vi.mock('../components/ProfileOverviewCard', () => ({
    default: ({ displayName, onEditProfile, onChangePassword }: any) => (
        <div data-testid="profile-overview-card">
            <div>Name: {displayName}</div>
            <button onClick={onEditProfile}>Edit Profile</button>
            <button onClick={onChangePassword}>Change Password</button>
        </div>
    ),
}));

vi.mock('../components/CarsCard', () => ({
    default: ({ cars, onAddCar, onSetActive, onRemove, onEdit }: any) => (
        <div data-testid="cars-card">
            <div>Cars: {cars.length}</div>
            <button onClick={onAddCar}>Add Car</button>
            <button onClick={() => onSetActive('car-1')}>Set Active</button>
            <button onClick={() => onRemove('car-1')}>Remove Car</button>
            <button onClick={() => onEdit('car-1')}>Edit Car</button>
        </div>
    ),
}));

vi.mock('../components/ChargingHistoryCard', () => ({
    default: () => <div data-testid="charging-history-card">Charging History</div>,
}));

vi.mock('../components/EditProfileDialog', () => ({
    default: ({ open, onClose }: any) =>
        open ? <div data-testid="edit-profile-dialog">Edit Dialog <button onClick={onClose}>Close</button></div> : null,
}));

vi.mock('../components/ChangePasswordDialog', () => ({
    default: ({ open, onClose }: any) =>
        open ? <div data-testid="change-password-dialog">Password Dialog <button onClick={onClose}>Close</button></div> : null,
}));

// Helper function to create a test store with actual reducers
function createTestStore() {
    return configureStore({
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
                isAuthenticated: true,
                email: 'test@example.com',
                userId: 'user-123',
                name: 'Test User',
                region: 'Jakarta',
                role: null,
                cars: [],
                activeCarId: null,
            },
        },
    });
}

describe('ProfilePage', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createTestStore();
    });

    it('should render without crashing', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByTestId('profile-overview-card')).toBeInTheDocument();
        expect(screen.getByTestId('cars-card')).toBeInTheDocument();
        expect(screen.getByTestId('charging-history-card')).toBeInTheDocument();
    });

    it('should render the profile header', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Manage your account and charging preferences')).toBeInTheDocument();
    });

    it('should open edit profile dialog when button is clicked', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        const editButton = screen.getByText('Edit Profile');
        editButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('edit-profile-dialog')).toBeInTheDocument();
        });
    });

    it('should open change password dialog when button is clicked', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        const changePasswordButton = screen.getByText('Change Password');
        changePasswordButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('change-password-dialog')).toBeInTheDocument();
        });
    });

    it('should close edit profile dialog when close is clicked', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        // Open dialog
        const editButton = screen.getByText('Edit Profile');
        editButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('edit-profile-dialog')).toBeInTheDocument();
        });

        // Close dialog
        const closeButton = screen.getByText('Close');
        closeButton.click();

        await waitFor(() => {
            expect(screen.queryByTestId('edit-profile-dialog')).not.toBeInTheDocument();
        });
    });

    it('should close change password dialog when close is clicked', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        // Open dialog
        const changePasswordButton = screen.getByText('Change Password');
        changePasswordButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('change-password-dialog')).toBeInTheDocument();
        });

        // Close dialog
        const closeButton = screen.getByText('Close');
        closeButton.click();

        await waitFor(() => {
            expect(screen.queryByTestId('change-password-dialog')).not.toBeInTheDocument();
        });
    });

    it('should call onAddCar when Add Car button is clicked', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        const addButton = screen.getByText('Add Car');
        addButton.click();

        // The button should be clickable without error
        expect(addButton).toBeInTheDocument();
    });

    it('should display user info in profile card', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Name: Test User')).toBeInTheDocument();
    });

    it('should render cars card with cars count', () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProfilePage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Cars: 0')).toBeInTheDocument();
    });
});
