import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequireAuth, RedirectIfAuth, RequireAdmin } from '../guards';
import * as router from 'react-router';
import * as reduxHooks from '../../app/hooks';

// Mock react-router
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
        Outlet: () => <div data-testid="outlet" />,
        useLocation: vi.fn(),
        useSearchParams: vi.fn(),
    };
});

// Mock hooks
vi.mock('../../app/hooks', () => ({
    useAppSelector: vi.fn(),
}));

describe('Router Guards', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('RequireAuth', () => {
        it('should render Outlet if authenticated', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue(true); // isAuthenticated
            (router.useLocation as any).mockReturnValue({ pathname: '/protected', search: '', hash: '' });

            render(<RequireAuth />);

            expect(screen.getByTestId('outlet')).toBeInTheDocument();
            expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
        });

        it('should redirect to login if not authenticated', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue(false); // isAuthenticated
            (router.useLocation as any).mockReturnValue({
                pathname: '/protected',
                search: '?foo=bar',
                hash: '#baz'
            });

            render(<RequireAuth />);

            const navigate = screen.getByTestId('navigate');
            expect(navigate).toBeInTheDocument();
            const next = encodeURIComponent('/protected?foo=bar#baz');
            expect(navigate).toHaveAttribute('data-to', `/login?next=${next}`);
        });

        it('should handle session storage logout redirect', () => {
             (reduxHooks.useAppSelector as any).mockReturnValue(false);
             (router.useLocation as any).mockReturnValue({ pathname: '/', search: '', hash: '' });

             const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('true');
             const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

             render(<RequireAuth />);

             const navigate = screen.getByTestId('navigate');
             expect(getItemSpy).toHaveBeenCalledWith('cf_logout_redirect');
             expect(navigate).toHaveAttribute('data-to', '/');
             expect(removeItemSpy).toHaveBeenCalledWith('cf_logout_redirect');
        });
    });

    describe('RedirectIfAuth', () => {
        it('should render Outlet if not authenticated', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue(false);
            (router.useSearchParams as any).mockReturnValue([new URLSearchParams()]);

            render(<RedirectIfAuth />);
             expect(screen.getByTestId('outlet')).toBeInTheDocument();
        });

        it('should redirect to next param if authenticated', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue(true);
            (router.useSearchParams as any).mockReturnValue([new URLSearchParams('next=/dashboard')]);

            render(<RedirectIfAuth />);

            const navigate = screen.getByTestId('navigate');
            expect(navigate).toHaveAttribute('data-to', '/dashboard');
        });

         it('should fallback to / if next param is invalid', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue(true);

            // Test cases for unsafe paths
            const unsafePaths = ['http://evil.com', 'javascript:void(0)', '/login', '/signup'];

            for(const path of unsafePaths) {
                (router.useSearchParams as any).mockReturnValue([new URLSearchParams(`next=${path}`)]);
                const { unmount } = render(<RedirectIfAuth />);
                const navigate = screen.getByTestId('navigate');
                expect(navigate).toHaveAttribute('data-to', '/');
                unmount();
            }
        });
    });

    describe('RequireAdmin', () => {
        it('should render Outlet if role is admin', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue('admin');

            render(<RequireAdmin />);
             expect(screen.getByTestId('outlet')).toBeInTheDocument();
        });

        it('should redirect to home if role is not admin', () => {
            (reduxHooks.useAppSelector as any).mockReturnValue('user');

            render(<RequireAdmin />);

            const navigate = screen.getByTestId('navigate');
            expect(navigate).toHaveAttribute('data-to', '/');
        });
    });
});
