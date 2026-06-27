import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddStationPage from '../index';
import * as router from 'react-router';
import * as route from '../addStationRoute';

// Mock the form card; the page only owns the submit side-effect + navigation now.
vi.mock('../components/StationFormCard', () => ({
    default: ({ onSubmit, serverError, submitLabel, defaultValues }: any) => (
        <div>
            <div data-testid="server-error">{serverError}</div>
            <div data-testid="submit-label">{submitLabel}</div>
            <div data-testid="default-status">{defaultValues?.status}</div>
            <button onClick={() => onSubmit({ name: 'My Station' })}>submit</button>
        </div>
    ),
}));

vi.mock('../addStationRoute');
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return { ...actual, useNavigate: vi.fn() };
});

describe('AddStationPage', () => {
    const navigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (router.useNavigate as any).mockReturnValue(navigate);
    });

    it('renders the form card with the create label + blank defaults', () => {
        render(<AddStationPage />);
        expect(screen.getByTestId('submit-label')).toHaveTextContent('Create station');
        expect(screen.getByTestId('default-status')).toHaveTextContent('AVAILABLE');
    });

    it('navigates to /admin on a successful submit', async () => {
        vi.mocked(route.createStationRequest).mockResolvedValue({ ok: true });
        render(<AddStationPage />);

        fireEvent.click(screen.getByText('submit'));

        await waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin'));
        expect(route.createStationRequest).toHaveBeenCalledWith({ name: 'My Station' });
    });

    it('shows the server error and does not navigate on failure', async () => {
        vi.mocked(route.createStationRequest).mockResolvedValue({
            ok: false,
            error: 'Server Fail',
        });
        render(<AddStationPage />);

        fireEvent.click(screen.getByText('submit'));

        await waitFor(() =>
            expect(screen.getByTestId('server-error')).toHaveTextContent('Server Fail')
        );
        expect(navigate).not.toHaveBeenCalled();
    });
});
