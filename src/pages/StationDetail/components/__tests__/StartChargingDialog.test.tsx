import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StartChargingDialog from '../StartChargingDialog';
import type { UserCar } from '../../../../features/auth/authSlice';
import type { ConnectorType } from '../../../../models/model';

describe('StartChargingDialog', () => {
    const mockConnectorTypes: ConnectorType[] = ['CCS2', 'Type2', 'CHAdeMO'];

    const mockVehicles: UserCar[] = [
        {
            id: 'car1',
            name: 'Tesla Model 3',
            connectorTypes: ['CCS2'],
            batteryCapacity: 75,
        },
        {
            id: 'car2',
            name: 'Nissan Leaf',
            connectorTypes: ['CHAdeMO'],
            batteryCapacity: 40,
        },
    ];

    const mockProps = {
        open: true,
        connectorTypes: mockConnectorTypes,
        selectedConnectorType: 'CCS2' as ConnectorType,
        onConnectorChange: vi.fn(),
        vehicles: mockVehicles,
        selectedVehicleId: 'car1',
        onVehicleChange: vi.fn(),
        notifyAtPercent: 80 as number | null,
        onNotifyAtPercentChange: vi.fn(),
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        isSubmitting: false,
    };

    it('should render without crashing', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByText('Choose connector')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
        render(<StartChargingDialog {...mockProps} open={false} />);
        expect(screen.queryByText('Choose connector')).not.toBeInTheDocument();
    });

    it('should render vehicle section when vehicles are present', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByText('Vehicle')).toBeInTheDocument();
    });

    it('should not render vehicle section when no vehicles', () => {
        render(<StartChargingDialog {...mockProps} vehicles={[]} />);
        expect(screen.queryByText('Vehicle')).not.toBeInTheDocument();
    });

    it('should render connector section', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByText('Connector')).toBeInTheDocument();
    });

    it('should render all connector types', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByText('CCS2')).toBeInTheDocument();
        expect(screen.getByText('Type2')).toBeInTheDocument();
        expect(screen.getByText('CHAdeMO')).toBeInTheDocument();
    });

    it('should render all vehicles', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByText('Tesla Model 3 | 75 kWh')).toBeInTheDocument();
        expect(screen.getByText('Nissan Leaf | 40 kWh')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
        render(<StartChargingDialog {...mockProps} />);
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start charging' })).toBeInTheDocument();
    });

    it('should call onConnectorChange when connector is selected', () => {
        render(<StartChargingDialog {...mockProps} />);
        fireEvent.click(screen.getByText('Type2'));
        expect(mockProps.onConnectorChange).toHaveBeenCalledWith('Type2');
    });

    it('should call onVehicleChange when vehicle is selected', () => {
        render(<StartChargingDialog {...mockProps} />);
        fireEvent.click(screen.getByText('Nissan Leaf | 40 kWh'));
        expect(mockProps.onVehicleChange).toHaveBeenCalledWith('car2');
    });

    it('should call onClose when cancel button is clicked', () => {
        render(<StartChargingDialog {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        render(<StartChargingDialog {...mockProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Start charging' }));
        expect(mockProps.onConfirm).toHaveBeenCalled();
    });

    it('should disable confirm button when canSubmit is false', () => {
        render(<StartChargingDialog {...mockProps} selectedConnectorType={null} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeDisabled();
    });

    it('should disable confirm button when no connectors available', () => {
        render(<StartChargingDialog {...mockProps} connectorTypes={[]} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeDisabled();
    });

    it('should disable confirm button when isSubmitting is true', () => {
        render(<StartChargingDialog {...mockProps} isSubmitting={true} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeDisabled();
    });

    it('should show message when no connectors available', () => {
        render(<StartChargingDialog {...mockProps} connectorTypes={[]} />);
        expect(screen.getByText('No connectors are available for this station.')).toBeInTheDocument();
    });

    it('should show message when all vehicles are charging', () => {
        const chargingVehicles: UserCar[] = [
            {
                id: 'car1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                batteryCapacity: 75,
                chargingStatus: 'charging',
            },
        ];
        render(<StartChargingDialog {...mockProps} vehicles={chargingVehicles} />);
        expect(screen.getByText('All your vehicles are currently charging.')).toBeInTheDocument();
    });

    it('should disable vehicle that is charging', () => {
        const chargingVehicles: UserCar[] = [
            {
                id: 'car1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                batteryCapacity: 75,
                chargingStatus: 'charging',
            },
        ];
        render(<StartChargingDialog {...mockProps} vehicles={chargingVehicles} />);
        const radio = screen.getByRole('radio', { name: /Tesla Model 3.*Charging/ });
        expect(radio).toBeDisabled();
    });

    it('should render charging label for charging vehicle', () => {
        const chargingVehicles: UserCar[] = [
            {
                id: 'car1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                batteryCapacity: 75,
                chargingStatus: 'charging',
            },
        ];
        render(<StartChargingDialog {...mockProps} vehicles={chargingVehicles} />);
        expect(screen.getByText(/Tesla Model 3.*\(Charging\)/)).toBeInTheDocument();
    });

    it('should render vehicle name without battery capacity when not finite', () => {
        const vehiclesWithoutCapacity: UserCar[] = [
            {
                id: 'car1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                batteryCapacity: NaN,
            },
        ];
        render(<StartChargingDialog {...mockProps} vehicles={vehiclesWithoutCapacity} />);
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    });

    it('should enable confirm button when all conditions are met', () => {
        render(<StartChargingDialog {...mockProps} />);
        const button = screen.getByRole('button', { name: 'Start charging' });
        expect(button).toBeEnabled();
    });

    // The dialog renders in a portal (document.body) and the MUI Switch's single
    // <input type="checkbox"> has a version-dependent ARIA role, so query the DOM.
    const getToggle = () =>
        document.querySelector('input[type="checkbox"]') as HTMLInputElement;

    it('shows the notify-at control enabled with a slider when a threshold is set', () => {
        render(<StartChargingDialog {...mockProps} notifyAtPercent={80} />);
        expect(screen.getByText('Notify me at battery %')).toBeInTheDocument();
        expect(
            screen.getByText("We'll alert you when your battery reaches 80%.")
        ).toBeInTheDocument();
        expect(getToggle()).toBeChecked();
    });

    it('hides the slider and shows the complete-only note when disabled', () => {
        render(<StartChargingDialog {...mockProps} notifyAtPercent={null} />);
        expect(
            screen.getByText("You'll still be notified when charging completes.")
        ).toBeInTheDocument();
        expect(getToggle()).not.toBeChecked();
    });

    it('enables notifications at the default threshold when toggled on', () => {
        const onNotifyAtPercentChange = vi.fn();
        render(
            <StartChargingDialog
                {...mockProps}
                notifyAtPercent={null}
                onNotifyAtPercentChange={onNotifyAtPercentChange}
            />
        );
        fireEvent.click(getToggle());
        expect(onNotifyAtPercentChange).toHaveBeenCalledWith(80);
    });

    it('disables notifications when toggled off', () => {
        const onNotifyAtPercentChange = vi.fn();
        render(
            <StartChargingDialog
                {...mockProps}
                notifyAtPercent={80}
                onNotifyAtPercentChange={onNotifyAtPercentChange}
            />
        );
        fireEvent.click(getToggle());
        expect(onNotifyAtPercentChange).toHaveBeenCalledWith(null);
    });
});
