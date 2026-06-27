import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import EditCarPage from '../index';
import type { UserCar } from '../../../features/auth/authSlice';

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

const mockUseNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ carId: 'car1' }));

vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        useNavigate: () => mockUseNavigate,
        useParams: () => mockUseParams(),
    };
});

// The form section now receives the RHF default values.
vi.mock('../components/EditCarFormSection', () => ({
    default: ({ defaultValues }: any) => (
        <div data-testid="edit-car-form-section">
            <div data-testid="car-name">{defaultValues.name}</div>
        </div>
    ),
}));

vi.mock('../components/EditCarNotFound', () => ({
    default: () => <div data-testid="edit-car-not-found">Car not found</div>,
}));

vi.mock('../components/EditCarLayout', () => ({
    default: ({ children }: any) => <div data-testid="edit-car-layout">{children}</div>,
}));

const createMockStore = (cars: UserCar[] = []) =>
    configureStore({
        reducer: combineReducers({ auth: createMockAuthReducer(cars) }),
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

    it('renders the form section (with the car defaults) inside the layout', () => {
        renderEditCarPage();
        expect(screen.getByTestId('edit-car-layout')).toBeInTheDocument();
        expect(screen.getByTestId('edit-car-form-section')).toBeInTheDocument();
        expect(screen.getByTestId('car-name')).toHaveTextContent('Tesla Model 3');
    });

    it('shows not found when carId does not match any car', () => {
        mockUseParams.mockReturnValue({ carId: 'car2' });
        renderEditCarPage();
        expect(screen.getByTestId('edit-car-not-found')).toBeInTheDocument();
    });

    it('shows not found when the cars array is empty', () => {
        mockUseParams.mockReturnValue({ carId: 'nonexistent' });
        renderEditCarPage([]);
        expect(screen.getByTestId('edit-car-not-found')).toBeInTheDocument();
    });
});
