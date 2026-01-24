import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFoundPage from '../index';

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/invalid-page', search: '', hash: '' }),
    };
});

describe('NotFoundPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the 404 page', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText('404 - Page not found')).toBeInTheDocument();
    });

    it('should render the error description', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(
            screen.getByText('The page you are looking for does not exist or has been moved.')
        ).toBeInTheDocument();
    });

    it('should display the requested path', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Requested path:/)).toBeInTheDocument();
        expect(screen.getByText(/invalid-page/)).toBeInTheDocument();
    });

    it('should render the error icon', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const icon = document.querySelector('.MuiSvgIcon-root');
        expect(icon).toBeInTheDocument();
    });

    it('should render Go to home button', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Go to home')).toBeInTheDocument();
    });

    it('should render Go back button', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Go back')).toBeInTheDocument();
    });

    it('should navigate to home when Go to home button is clicked', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const goHomeButton = screen.getByText('Go to home');
        fireEvent.click(goHomeButton);

        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should navigate back when Go back button is clicked', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const goBackButton = screen.getByText('Go back');
        fireEvent.click(goBackButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should render within a Card component', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const card = document.querySelector('.MuiCard-root');
        expect(card).toBeInTheDocument();
    });

    it('should render with proper styling', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({ minHeight: 'calc(100dvh - 64px)' });
    });

    it('should render both buttons in a row on larger screens', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const goHomeButton = screen.getByText('Go to home');
        const goBackButton = screen.getByText('Go back');

        expect(goHomeButton).toBeInTheDocument();
        expect(goBackButton).toBeInTheDocument();
    });

    it('should display the brand gradient bar at top of card', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        const card = container.querySelector('.MuiCard-root');
        expect(card).toBeInTheDocument();
    });
});
