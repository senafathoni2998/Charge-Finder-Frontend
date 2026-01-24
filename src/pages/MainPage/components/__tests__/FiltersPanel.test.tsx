import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FiltersPanel from '../FiltersPanel';
import type { StationWithDistance, FilterStatus } from '../../types';
import type { UserCar } from '../../../features/auth/authSlice';

const mockStations: StationWithDistance[] = [
    {
        id: 'station-1',
        name: 'Test Station 1',
        address: '123 Test St',
        lat: 40.7128,
        lng: -74.006,
        status: 'AVAILABLE',
        isChargingHere: false,
        connectors: [{ type: 'CCS2', powerKW: 150 }],
        distanceKm: 5.5,
        lastUpdatedISO: new Date().toISOString(),
    },
];

const mockCars: UserCar[] = [
    { id: 'car-1', name: 'Tesla Model 3', connectorTypes: ['CCS2'], minKW: 50, batteryCapacity: 75 },
    { id: 'car-2', name: 'Nissan Leaf', connectorTypes: ['CHAdeMO'], minKW: 30, batteryCapacity: 40 },
];

// Mock StationsList component
vi.mock('../StationsList', () => ({
    default: ({ stations, selectedId, onFocusStation }: any) => (
        <div data-testid="stations-list-mock">
            <div>Count: {stations.length}</div>
            <div>Selected: {selectedId || 'none'}</div>
        </div>
    ),
}));

describe('FiltersPanel', () => {
    const defaultProps = {
        query: '',
        status: '' as FilterStatus,
        connectorSet: new Set<string>(),
        minKW: 0,
        effectiveMinKW: 0,
        radiusKm: 5,
        useCarFilter: false,
        isAuthenticated: false,
        activeCarId: null,
        activeCar: null,
        cars: [],
        stations: mockStations,
        selectedId: null,
        onQueryChange: vi.fn(),
        onStatusChange: vi.fn(),
        onToggleConnector: vi.fn(),
        onMinKWChange: vi.fn(),
        onRadiusKmChange: vi.fn(),
        onSelectCar: vi.fn(),
        onToggleUseCarFilter: vi.fn(),
        onLogin: vi.fn(),
        onAddCar: vi.fn(),
        onFocusStation: vi.fn(),
    };

    it('should render search input', () => {
        render(<FiltersPanel {...defaultProps} />);
        expect(screen.getByPlaceholderText(/Search station or area/)).toBeInTheDocument();
    });

    it('should call onQueryChange when search input changes', () => {
        const onQueryChange = vi.fn();
        render(<FiltersPanel {...defaultProps} onQueryChange={onQueryChange} />);

        const searchInput = screen.getByPlaceholderText(/Search station or area/);
        fireEvent.change(searchInput, { target: { value: 'test query' } });

        expect(onQueryChange).toHaveBeenCalledWith('test query');
    });

    it('should render Filters accordion', () => {
        render(<FiltersPanel {...defaultProps} />);
        expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render guest mode message when not authenticated', () => {
        render(<FiltersPanel {...defaultProps} isAuthenticated={false} />);
        expect(screen.getByText('Guest mode')).toBeInTheDocument();
        expect(screen.getByText('Log in to save cars and personalize filters.')).toBeInTheDocument();
    });

    it('should render login button when not authenticated', () => {
        const onLogin = vi.fn();
        render(<FiltersPanel {...defaultProps} isAuthenticated={false} onLogin={onLogin} />);

        const loginButton = screen.getByText('Log in');
        expect(loginButton).toBeInTheDocument();
    });

    it('should call onLogin when login button is clicked', () => {
        const onLogin = vi.fn();
        render(<FiltersPanel {...defaultProps} isAuthenticated={false} onLogin={onLogin} />);

        const loginButton = screen.getByText('Log in');
        fireEvent.click(loginButton);

        expect(onLogin).toHaveBeenCalledTimes(1);
    });

    it('should not render guest mode when authenticated', () => {
        render(<FiltersPanel {...defaultProps} isAuthenticated={true} />);
        expect(screen.queryByText('Guest mode')).not.toBeInTheDocument();
    });

    it('should render availability filter buttons', () => {
        render(<FiltersPanel {...defaultProps} />);
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Busy')).toBeInTheDocument();
        expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should render distance slider', () => {
        render(<FiltersPanel {...defaultProps} radiusKm={10} />);
        expect(screen.getByText('10 km')).toBeInTheDocument();
    });

    it('should call onRadiusKmChange when distance slider changes', () => {
        const onRadiusKmChange = vi.fn();
        render(<FiltersPanel {...defaultProps} onRadiusKmChange={onRadiusKmChange} />);

        const sliders = screen.getAllByRole('slider');
        const distanceSlider = sliders[0];
        fireEvent.change(distanceSlider, { target: { value: 15 } });

        expect(onRadiusKmChange).toHaveBeenCalled();
    });

    it('should render car selector when authenticated with active car', () => {
        const activeCar = mockCars[0];
        const { container } = render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId="car-1"
                activeCar={activeCar}
                cars={mockCars}
            />
        );

        expect(screen.getAllByText('Selected car').length).toBeGreaterThan(0);
    });

    it('should render add car button when authenticated without cars', () => {
        const onAddCar = vi.fn();
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId={null}
                activeCar={null}
                cars={[]}
                onAddCar={onAddCar}
            />
        );

        expect(screen.getByText('Add a car to personalize results.')).toBeInTheDocument();
        expect(screen.getByText('Add car')).toBeInTheDocument();
    });

    it('should call onAddCar when add car button is clicked', () => {
        const onAddCar = vi.fn();
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId={null}
                activeCar={null}
                cars={[]}
                onAddCar={onAddCar}
            />
        );

        const addButton = screen.getByText('Add car');
        fireEvent.click(addButton);

        expect(onAddCar).toHaveBeenCalledTimes(1);
    });

    it('should render connector chips', () => {
        render(<FiltersPanel {...defaultProps} />);
        expect(screen.getByText('CCS2')).toBeInTheDocument();
        expect(screen.getByText('Type2')).toBeInTheDocument();
        expect(screen.getByText('CHAdeMO')).toBeInTheDocument();
    });

    it('should call onToggleConnector when connector chip is clicked', () => {
        const onToggleConnector = vi.fn();
        render(<FiltersPanel {...defaultProps} onToggleConnector={onToggleConnector} />);

        const ccs2Chip = screen.getByText('CCS2');
        fireEvent.click(ccs2Chip);

        expect(onToggleConnector).toHaveBeenCalledWith('CCS2');
    });

    it('should render minimum power slider', () => {
        render(<FiltersPanel {...defaultProps} effectiveMinKW={50} />);
        const powerText = screen.getByText(/50 kW/);
        expect(powerText).toBeInTheDocument();
    });

    it('should call onMinKWChange when min power slider changes', () => {
        const onMinKWChange = vi.fn();
        render(<FiltersPanel {...defaultProps} onMinKWChange={onMinKWChange} />);

        const slider = screen.getAllByRole('slider')[1];
        fireEvent.change(slider, { target: { value: 100 } });

        expect(onMinKWChange).toHaveBeenCalled();
    });

    it('should disable connectors when useCarFilter is true', () => {
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId="car-1"
                activeCar={mockCars[0]}
                cars={mockCars}
                useCarFilter={true}
            />
        );

        const ccs2Chip = screen.getByText('CCS2');
        expect(ccs2Chip.closest('.MuiChip-root')).toHaveClass('Mui-disabled');
    });

    it('should show car filter message when useCarFilter is true', () => {
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId="car-1"
                activeCar={mockCars[0]}
                cars={mockCars}
                useCarFilter={true}
            />
        );

        expect(screen.getAllByText('Connector filters are driven by your car profile.').length).toBeGreaterThan(0);
    });

    it('should call onStatusChange when availability button is clicked', () => {
        const onStatusChange = vi.fn();
        render(<FiltersPanel {...defaultProps} onStatusChange={onStatusChange} />);

        const availableButton = screen.getByText('Available');
        fireEvent.click(availableButton);

        expect(onStatusChange).toHaveBeenCalledWith('AVAILABLE');
    });

    it('should render my car section when authenticated', () => {
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId="car-1"
                activeCar={mockCars[0]}
                cars={mockCars}
            />
        );

        expect(screen.getByText('My car')).toBeInTheDocument();
    });

    it('should call onSelectCar when car selection changes', () => {
        const onSelectCar = vi.fn();
        render(
            <FiltersPanel
                {...defaultProps}
                isAuthenticated={true}
                activeCarId="car-1"
                activeCar={mockCars[0]}
                cars={mockCars}
                onSelectCar={onSelectCar}
            />
        );

        const select = screen.getByDisplayValue('car-1');
        fireEvent.change(select, { target: { value: 'car-2' } });

        expect(onSelectCar).toHaveBeenCalledWith('car-2');
    });
});
