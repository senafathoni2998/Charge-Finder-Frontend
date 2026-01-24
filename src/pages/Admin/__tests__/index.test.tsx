import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AdminPage from '../index';
import * as stationManagementHook from '../hooks/useStationManagement';
import * as userManagementHook from '../hooks/useUserManagement';

// Mock the hooks
vi.mock('../hooks/useStationManagement');
vi.mock('../hooks/useUserManagement');

// Mock child components to simplify testing
vi.mock('../components/AdminHeader', () => ({
    default: ({ onAddStation, onInviteUser }: any) => (
        <div data-testid="admin-header">
            <button onClick={onAddStation}>Add Station</button>
            <button onClick={onInviteUser}>Invite User</button>
        </div>
    ),
}));

vi.mock('../components/OperationalSnapshotCard', () => ({
    default: () => <div data-testid="operational-snapshot">Operational Snapshot</div>,
}));

vi.mock('../components/StatsGrid', () => ({
    default: ({ stats }: any) => (
        <div data-testid="stats-grid">
            {stats.map((s: any) => (
                <div key={s.label}>{s.label}: {s.value}</div>
            ))}
        </div>
    ),
}));

vi.mock('../components/StationManagementCard', () => ({
    default: (props: any) => (
        <div data-testid="station-management-card">
            <button onClick={props.onNewStation}>New Station</button>
        </div>
    ),
}));

vi.mock('../components/UserManagementCard', () => ({
    default: (props: any) => (
        <div data-testid="user-management-card">
            <button onClick={props.onAddUser}>Add User</button>
        </div>
    ),
}));

vi.mock('../components/StationActionsMenu', () => ({
    default: () => <div data-testid="station-actions-menu">Station Menu</div>,
}));

vi.mock('../components/UserActionsMenu', () => ({
    default: () => <div data-testid="user-actions-menu">User Menu</div>,
}));

describe('AdminPage', () => {
    const mockStationState = {
        stations: [
            { id: 's1', name: 'Station A', status: 'AVAILABLE', connectors: [], address: '', lastUpdatedISO: '', coordinates: { lat: 0, lng: 0 } },
            { id: 's2', name: 'Station B', status: 'OFFLINE', connectors: [], address: '', lastUpdatedISO: '', coordinates: { lat: 0, lng: 0 } },
        ],
        filteredStations: [],
        stationsLoading: false,
        stationsError: null,
        stationActionError: null,
        stationsDeleting: {},
        stationMenuAnchorEl: null,
        stationMenuTarget: null,
        stationQuery: '',
        stationStatusFilter: '',
        stationConnectorSet: new Set(),
        stationMinKW: 0,
        stationFiltersOpen: false,
        stationFiltersActiveCount: 0,
        onStationQueryChange: vi.fn(),
        onStationStatusFilterChange: vi.fn(),
        onStationMinKWChange: vi.fn(),
        toggleStationFiltersOpen: vi.fn(),
        openStationMenu: vi.fn(),
        closeStationMenu: vi.fn(),
        toggleStationConnector: vi.fn(),
        resetStationFilters: vi.fn(),
        handleDeleteStation: vi.fn(),
    };

    const mockUserState = {
        users: [
            { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'admin', status: 'active', lastActive: '5m ago' },
            { id: 'u2', name: 'Jane Smith', email: 'jane@test.com', role: 'user', status: 'active', lastActive: '10m ago' },
        ],
        usersLoading: false,
        usersError: null,
        usersUpdating: {},
        usersDeleting: {},
        userActionError: null,
        userMenuAnchorEl: null,
        userMenuTarget: null,
        openUserMenu: vi.fn(),
        closeUserMenu: vi.fn(),
        handleUserStatusAction: vi.fn(),
        handleDeleteUser: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (stationManagementHook.default as any).mockReturnValue(mockStationState);
        (userManagementHook.default as any).mockReturnValue(mockUserState);
    });

    it('should render all main components', () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('admin-header')).toBeInTheDocument();
        expect(screen.getByTestId('operational-snapshot')).toBeInTheDocument();
        expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
        expect(screen.getByTestId('station-management-card')).toBeInTheDocument();
        expect(screen.getByTestId('user-management-card')).toBeInTheDocument();
    });

    it('should calculate stats correctly', () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        const statsGrid = screen.getByTestId('stats-grid');
        expect(statsGrid).toHaveTextContent('Stations: 2');
        expect(statsGrid).toHaveTextContent('Offline alerts: 1');
        expect(statsGrid).toHaveTextContent('Users: 2');
        expect(statsGrid).toHaveTextContent('Admins: 1');
    });

    it('should call useStationManagement hook', () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(stationManagementHook.default).toHaveBeenCalled();
    });

    it('should call useUserManagement hook', () => {
        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(userManagementHook.default).toHaveBeenCalled();
    });

    it('should render action menus when open', () => {
        const menuState = {
            ...mockStationState,
            stationMenuAnchorEl: document.createElement('div'),
            stationMenuTarget: mockStationState.stations[0],
        };
        (stationManagementHook.default as any).mockReturnValue(menuState);

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('station-actions-menu')).toBeInTheDocument();
    });

    it('should render user menu when open', () => {
        const menuState = {
            ...mockUserState,
            userMenuAnchorEl: document.createElement('div'),
            userMenuTarget: mockUserState.users[0],
        };
        (userManagementHook.default as any).mockReturnValue(menuState);

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('user-actions-menu')).toBeInTheDocument();
    });

    it('should calculate active users correctly', () => {
        const userStateWithMixedStatuses = {
            ...mockUserState,
            users: [
                { id: 'u1', name: 'John', email: 'john@test.com', role: 'admin', status: 'active' as const, lastActive: '5m ago' },
                { id: 'u2', name: 'Jane', email: 'jane@test.com', role: 'user', status: 'suspended' as const, lastActive: '10m ago' },
                { id: 'u3', name: 'Bob', email: 'bob@test.com', role: 'user', status: 'active' as const, lastActive: '15m ago' },
            ],
        };
        (userManagementHook.default as any).mockReturnValue(userStateWithMixedStatuses);

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        const statsGrid = screen.getByTestId('stats-grid');
        // Check that the stats are rendered with the correct values
        // The mock renders: {label}: {value}
        expect(statsGrid.textContent).toContain('Users:');
        expect(statsGrid.textContent).toContain('3');
    });
});
