import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCarFormCard from '../AddCarFormCard';
import type { ConnectorType } from '../../../../models/model';

type Overrides = Partial<React.ComponentProps<typeof AddCarFormCard>>;

function renderCard(overrides: Overrides = {}) {
    const props = {
        connectorOptions: ['Type2', 'CCS2'] as ConnectorType[],
        minPower: { min: 0, max: 200, step: 10 },
        serverError: null,
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        ...overrides,
    };
    render(<AddCarFormCard {...props} />);
    return props;
}

describe('AddCarFormCard', () => {
    it('renders the fields + actions', () => {
        renderCard();
        expect(screen.getByLabelText('Car name')).toBeInTheDocument();
        expect(screen.getByLabelText('Battery capacity (kWh)')).toBeInTheDocument();
        expect(screen.getByText('Connector types')).toBeInTheDocument();
        expect(screen.getByText('Preferred minimum power')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save car' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows the server error', () => {
        renderCard({ serverError: 'Something went wrong' });
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('calls onCancel', () => {
        const props = renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(props.onCancel).toHaveBeenCalled();
    });

    it('submits the values once a connector is selected', async () => {
        const props = renderCard();
        fireEvent.change(screen.getByLabelText('Car name'), {
            target: { value: 'Test Car' },
        });
        fireEvent.click(screen.getByText('Type2'));
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));

        await waitFor(() =>
            expect(props.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Test Car', connectorTypes: ['Type2'] })
            )
        );
    });

    it('blocks submit + shows the connector error when none selected', async () => {
        const props = renderCard();
        fireEvent.click(screen.getByRole('button', { name: 'Save car' }));

        await waitFor(() =>
            expect(
                screen.getByText('Select at least one connector type.')
            ).toBeInTheDocument()
        );
        expect(props.onSubmit).not.toHaveBeenCalled();
    });
});
