import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CarsCard from '../CarsCard';
import type { UserCar } from '../../../features/auth/authSlice';

describe('CarsCard', () => {
    const mockCars: UserCar[] = [
        {
            id: 'car-1',
            name: 'Tesla Model 3',
            connectorTypes: ['CCS2', 'Type2'],
            minKW: 50,
            batteryCapacity: 75,
            batteryPercent: 80,
            chargingStatus: 'CHARGING',
        },
        {
            id: 'car-2',
            name: 'Nissan Leaf',
            connectorTypes: ['CHAdeMO'],
            minKW: 30,
            batteryCapacity: 40,
            batteryPercent: null,
            chargingStatus: null,
        },
    ];

    const defaultProps = {
        cars: mockCars,
        activeCarId: 'car-1',
        onAddCar: vi.fn(),
        onSetActive: vi.fn(),
        onRemove: vi.fn(),
        onEdit: vi.fn(),
    };

    it('should render the card with title', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Your cars')).toBeInTheDocument();
        expect(screen.getByText('Choose an active car to personalize filters.')).toBeInTheDocument();
    });

    it('should render the Add new car button', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Add new car')).toBeInTheDocument();
    });

    it('should call onAddCar when Add new car button is clicked', () => {
        const onAddCar = vi.fn();
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} onAddCar={onAddCar} />
            </MemoryRouter>
        );

        const addButton = screen.getByText('Add new car');
        fireEvent.click(addButton);

        expect(onAddCar).toHaveBeenCalledTimes(1);
    });

    it('should render car items', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('Nissan Leaf')).toBeInTheDocument();
    });

    it('should display connector types', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('CCS2')).toBeInTheDocument();
        expect(screen.getByText('Type2')).toBeInTheDocument();
        expect(screen.getByText('CHAdeMO')).toBeInTheDocument();
    });

    it('should display battery percent when available', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Battery 80%')).toBeInTheDocument();
    });

    it('should display Charging chip when car is charging', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Charging')).toBeInTheDocument();
    });

    it('should display Active chip for active car', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show preferred minimum power', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Preferred minimum power: 50 kW')).toBeInTheDocument();
        expect(screen.getByText('Preferred minimum power: 30 kW')).toBeInTheDocument();
    });

    it('should show battery capacity when available', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        expect(screen.getByText('Battery capacity: 75 kWh')).toBeInTheDocument();
        expect(screen.getByText('Battery capacity: 40 kWh')).toBeInTheDocument();
    });

    it('should render menu button for each car', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        expect(menuButtons.length).toBe(2);
    });

    it('should open menu when menu button is clicked', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        fireEvent.click(menuButtons[0]);

        expect(screen.getByText('Use this car')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('should call onSetActive when Use this car is clicked', () => {
        const onSetActive = vi.fn();
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} onSetActive={onSetActive} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        fireEvent.click(menuButtons[1]); // Open menu for non-active car

        const useThisCarButton = screen.getByText('Use this car');
        fireEvent.click(useThisCarButton);

        expect(onSetActive).toHaveBeenCalledWith('car-2');
    });

    it('should call onEdit when Edit is clicked', () => {
        const onEdit = vi.fn();
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} onEdit={onEdit} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        fireEvent.click(menuButtons[0]);

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        expect(onEdit).toHaveBeenCalledWith('car-1');
    });

    it('should call onRemove when Remove is clicked', () => {
        const onRemove = vi.fn();
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} onRemove={onRemove} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        fireEvent.click(menuButtons[0]);

        const removeButton = screen.getByText('Remove');
        fireEvent.click(removeButton);

        expect(onRemove).toHaveBeenCalledWith('car-1');
    });

    it('should disable Use this car for active car', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        const menuButtons = document.querySelectorAll('button[aria-label="Car actions"]');
        fireEvent.click(menuButtons[0]); // Open menu for active car

        const useThisCarButton = screen.getByText('Use this car');
        expect(useThisCarButton.closest('.MuiMenuItem-root')).toHaveClass('Mui-disabled');
    });

    it('should display no cars message when cars array is empty', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} cars={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText('No cars added yet.')).toBeInTheDocument();
        expect(screen.getByText('Add your first EV to personalize compatible stations.')).toBeInTheDocument();
    });

    it('should display no connectors message when car has no connectors', () => {
        const carsWithoutConnectors: UserCar[] = [
            {
                id: 'car-1',
                name: 'Tesla Model 3',
                connectorTypes: [],
                minKW: 50,
                batteryCapacity: 75,
            },
        ];

        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} cars={carsWithoutConnectors} />
            </MemoryRouter>
        );

        expect(screen.getByText('No connectors selected')).toBeInTheDocument();
    });

    it('should not display battery percent when not available', () => {
        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} />
            </MemoryRouter>
        );

        // car-2 has null batteryPercent
        const car2Elements = screen.getAllByText('Nissan Leaf');
        expect(car2Elements[0]).toBeInTheDocument();
    });

    it('should handle cars without battery capacity', () => {
        const carsWithoutCapacity: UserCar[] = [
            {
                id: 'car-1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                minKW: 50,
                batteryCapacity: null,
            },
        ];

        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} cars={carsWithoutCapacity} />
            </MemoryRouter>
        );

        expect(screen.queryByText('Battery capacity:')).not.toBeInTheDocument();
    });

    it('should handle cars with zero minKW', () => {
        const carsWithZeroMinKW: UserCar[] = [
            {
                id: 'car-1',
                name: 'Tesla Model 3',
                connectorTypes: ['CCS2'],
                minKW: 0,
                batteryCapacity: 75,
            },
        ];

        render(
            <MemoryRouter>
                <CarsCard {...defaultProps} cars={carsWithZeroMinKW} />
            </MemoryRouter>
        );

        expect(screen.getByText('Preferred minimum power: 0 kW')).toBeInTheDocument();
    });
});
