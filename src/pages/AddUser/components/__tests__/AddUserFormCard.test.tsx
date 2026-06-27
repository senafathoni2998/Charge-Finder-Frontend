import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddUserFormCard from '../AddUserFormCard';

type Overrides = Partial<React.ComponentProps<typeof AddUserFormCard>>;

function renderCard(overrides: Overrides = {}) {
    const props = {
        serverError: null,
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        ...overrides,
    };
    render(<AddUserFormCard {...props} />);
    return props;
}

const fillValid = () => {
    fireEvent.change(screen.getByLabelText('Full name'), {
        target: { value: 'Valid Name' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'valid@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Region'), {
        target: { value: 'Jakarta' },
    });
};

describe('AddUserFormCard', () => {
    it('renders all fields', () => {
        renderCard();
        expect(screen.getByLabelText('Full name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Region')).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
        renderCard();
        const passwordInput = screen.getByLabelText('Password');
        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByLabelText('Show password'));
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('shows the server error message', () => {
        renderCard({ serverError: 'Invalid data' });
        expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });

    it('calls onCancel when Cancel is clicked', () => {
        const props = renderCard();
        fireEvent.click(screen.getByText('Cancel'));
        expect(props.onCancel).toHaveBeenCalled();
    });

    it('submits the validated values on a valid submit', async () => {
        const props = renderCard();
        fillValid();
        fireEvent.click(screen.getByRole('button', { name: 'Create user' }));

        await waitFor(() =>
            expect(props.onSubmit).toHaveBeenCalledWith({
                name: 'Valid Name',
                email: 'valid@test.com',
                role: 'user',
                password: 'Password123!',
                region: 'Jakarta',
            })
        );
    });

    it('blocks submit + shows an error for a too-short name', async () => {
        const props = renderCard();
        fireEvent.change(screen.getByLabelText('Full name'), {
            target: { value: 'A' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create user' }));

        await waitFor(() =>
            expect(
                screen.getByText('Name must be 2-50 characters.')
            ).toBeInTheDocument()
        );
        expect(props.onSubmit).not.toHaveBeenCalled();
    });
});
