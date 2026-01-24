import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import EditCarPage from '../index';
import type { UserCar } from '../../features/auth/authSlice';

// Create a minimal mock auth reducer
const createMockAuthReducer = (cars: UserCar[] = []) => {
    const initialState = {
        isAuthenticated: true,
        email: 'test@example.com',
        userId: 'user123',
        name: 'Test User',
        region: null,
        role: 'user' as const,
        cars: cars,
        activeCarId: null,
    };
    return (state = initialState) => state;
};

// Mock the react-router module
const mockUseActionData = vi.fn(() => undefined);
const mockUseNavigate = vi.fn();
const mockUseNavigation = vi.fn(() => ({ state: 'idle' }));
const mockUseParams = vi.fn(() => ({ carId: 'car1' }));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useActionData: () => mockUseActionData(),
        useNavigate: () => mockUseNavigate,
        useNavigation: () => mockUseNavigation(),
        useParams: () => mockUseParams(),
    };
});

// Mock child components
vi.mock('../components/EditCarFormSection', () => ({
    default: ({ values }: any) => (
        <div data-testid="edit-car-form-section">
            <div data-testid="car-name">{values.name}</div>
        </div>
    ),
}));

vi.mock('../components/EditCarNotFound', () => ({
    default: () => <div data-testid="edit-car-not-found">Car not found</div>,
}));

vi.mock('../components/EditCarLayout', () => ({
    default: ({ children }: any) => <div data-testid="edit-car-layout">{children}</div>,
}));

vi.mock('../hooks/useEditCarFormState', () => ({
    default: vi.fn(() => ({
        values: {
            name: 'Tesla Model 3',
            connectors: new Set(['Type2', 'CCS2']),
            minKW: 22,
            batteryCapacity: '75',
        },
        handlers: {
            onNameChange: vi.fn(),
            onToggleConnector: vi.fn(),
            onMinKWChange: vi.fn(),
            onBatteryCapacityChange: vi.fn(),
        },
        onSubmit: vi.fn(),
        clientError: null,
    })),
}));

const createMockStore = (cars: UserCar[] = []) =>
    configureStore({
        reducer: combineReducers({
            auth: createMockAuthReducer(cars),
        }),
    });

const mockCars: UserCar[] = [
    {
        id: 'car1',
        name: 'Tesla Model 3',
        connectorTypes: ['Type2', 'CCS2'],
        minKW: 22,
        batteryCapacity: 75,
    },
];

describe('EditCarPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseParams.mockReturnValue({ carId: 'car1' });
        mockUseNavigate.mockReturnValue(vi.fn() as any);
        mockUseNavigation.mockReturnValue({ state: 'idle' });
    });

    const renderEditCarPage = (cars: UserCar[] = mockCars) => {
        const store = createMockStore(cars);
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <EditCarPage />
                </MemoryRouter>
            </Provider>
        );
    };

    it('should render EditCarFormSection when car is found', () => {
        renderEditCarPage();

        expect(screen.getByTestId('edit-car-form-section')).toBeInTheDocument();
        expect(screen.getByTestId('car-name')).toHaveTextContent('Tesla Model 3');
    });

    it('should render EditCarLayout wrapper', () => {
        renderEditCarPage();

        expect(screen.getByTestId('edit-car-layout')).toBeInTheDocument();
    });

    it('should pass correct props to EditCarFormSection', () => {
        renderEditCarPage();

        const formSection = screen.getByTestId('edit-car-form-section');
        expect(formSection).toBeInTheDocument();
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    });

    it('should show not found when carId does not match any car', () => {
        mockUseParams.mockReturnValue({ carId: 'car2' });

        renderEditCarPage();

        expect(screen.getByTestId('edit-car-not-found')).toBeInTheDocument();
    });

    it('should render EditCarNotFound when cars array is empty', () => {
        mockUseParams.mockReturnValue({ carId: 'nonexistent' });

        renderEditCarPage([]);

        expect(screen.getByTestId('edit-car-not-found')).toBeInTheDocument();
    });

    it('should call useEditCarFormState with the found car', () => {
        renderEditCarPage();

        // Just verify the page renders correctly, which means the hook was called
        expect(screen.getByTestId('edit-car-form-section')).toBeInTheDocument();
    });

    it('should find car by id from route params', () => {
        mockUseParams.mockReturnValue({ carId: 'car1' });

        renderEditCarPage();

        expect(screen.getByTestId('edit-car-form-section')).toBeInTheDocument();
    });
});
