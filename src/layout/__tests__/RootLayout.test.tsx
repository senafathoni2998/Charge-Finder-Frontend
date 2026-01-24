import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RootLayout from '../RootLayout';
import * as router from 'react-router';
import * as reduxHooks from '../../app/hooks';

// Mock react-router
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useLocation: vi.fn(),
        useNavigate: vi.fn(),
        useNavigation: vi.fn(),
        Outlet: () => <div data-testid="outlet" />,
    };
});

// Mock hooks
vi.mock('../../app/hooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

// Mock MUI icons to avoid massive imports issues during test environment setup if any? 
// No, JSDOM handles them fine usually. But let's verify.

describe('RootLayout', () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (router.useNavigate as any).mockReturnValue(mockNavigate);
        (router.useNavigation as any).mockReturnValue({ state: 'idle' });
        (reduxHooks.useAppDispatch as any).mockReturnValue(mockDispatch);
    });

    const setup = (path = '/', appState = {}, authState = {}) => {
        (router.useLocation as any).mockReturnValue({ pathname: path });
        (reduxHooks.useAppSelector as any).mockImplementation((selector: any) => {
            const state = {
                app: { isMdMode: false, ...appState },
                auth: { isAuthenticated: false, role: 'user', ...authState },
            };
            return selector(state);
        });
        render(<RootLayout />);
    };

    it('should render correct title for root path', () => {
        setup('/');
        expect(screen.getByText('ChargeFinder')).toBeInTheDocument();
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('should show Back button on non-root path', () => {
        setup('/profile');
        const backButton = screen.getByLabelText('Go back');
        expect(backButton).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();

        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate back correctly for generic paths', () => {
        setup('/station/123');
        const backButton = screen.getByLabelText('Go back');
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should show Admin button for admin users', () => {
        setup('/', {}, { isAuthenticated: true, role: 'admin' });
        const adminButton = screen.getByLabelText('Open admin console');
        expect(adminButton).toBeInTheDocument();
        
        fireEvent.click(adminButton);
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('should not show Admin button for non-admin users', () => {
        setup('/', {}, { isAuthenticated: true, role: 'user' });
        expect(screen.queryByLabelText('Open admin console')).not.toBeInTheDocument();
    });

    it('should show loading indicator when navigating', () => {
        (router.useNavigation as any).mockReturnValue({ state: 'loading' });
        setup('/');
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should show filter button when not in Md mode', () => {
        setup('/', { isMdMode: false });
        const filterButton = screen.getByLabelText('Open filters');
        expect(filterButton).toBeInTheDocument();

        fireEvent.click(filterButton);
        expect(mockDispatch).toHaveBeenCalled();
        // Check if correct action was dispatched? 
        // We'd need to mock the action creator or check the object passed.
        // For now verifying interaction is good.
    });

     it('should hide filter button in Md mode', () => {
        setup('/', { isMdMode: true });
        expect(screen.queryByLabelText('Open filters')).not.toBeInTheDocument();
    });
});
