import { describe, it, expect, vi } from 'vitest';
import * as router from 'react-router';

// Mock dependencies
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        createBrowserRouter: vi.fn(),
    };
});

// Mock Layouts and Guards
vi.mock('../../layout/RootLayout', () => ({ default: () => 'RootLayout' }));
vi.mock('../guards', () => ({
    RequireAuth: () => 'RequireAuth',
    RedirectIfAuth: () => 'RedirectIfAuth',
    RequireAdmin: () => 'RequireAdmin',
}));
vi.mock('../../pages/RouteError', () => ({ default: () => 'RouteError' }));

// Mock Pages
vi.mock('../../pages/MainPage', () => ({ default: () => 'MainPage' }));
vi.mock('../../pages/StationDetail', () => ({ default: () => 'StationDetail' }));
vi.mock('../../pages/Profile', () => ({ 
    default: () => 'Profile', 
    profileLoader: () => 'profileLoader', 
    profileAction: () => 'profileAction' 
}));
vi.mock('../../pages/AddCar', () => ({ 
    default: () => 'AddCar', 
    addCarAction: () => 'addCarAction' 
}));
vi.mock('../../pages/EditCar', () => ({ 
    default: () => 'EditCar', 
    editCarAction: () => 'editCarAction' 
}));
vi.mock('../../pages/Admin', () => ({ default: () => 'Admin' }));
vi.mock('../../pages/AddStation', () => ({ 
    default: () => 'AddStation', 
    addStationAction: () => 'addStationAction' 
}));
vi.mock('../../pages/EditStation', () => ({ 
    default: () => 'EditStation', 
    editStationAction: () => 'editStationAction' 
}));
vi.mock('../../pages/AddUser', () => ({ 
    default: () => 'AddUser', 
    addUserAction: () => 'addUserAction' 
}));
vi.mock('../../pages/Login', () => ({ 
    default: () => 'Login', 
    loginAction: () => 'loginAction' 
}));
vi.mock('../../pages/Signup', () => ({ 
    default: () => 'Signup', 
    signupAction: () => 'signupAction' 
}));
vi.mock('../../pages/NotFound', () => ({ default: () => 'NotFound' }));

// Import the router after mocks
import '../route';

describe('Router Configuration', () => {
    const getRouteConfig = () => (router.createBrowserRouter as any).mock.calls[0][0];

    const findRoute = (routes: any[], path?: string) => {
        return routes.find(r => r.path === path);
    };

    const findIndexRoute = (routes: any[]) => {
        return routes.find(r => r.index === true);
    };

    const findComponentRoute = (routes: any[], componentName: string) => {
        return routes.find(r => r.Component && r.Component() === componentName);
    }

    it('should create browser router with correct configuration', () => {
        expect(router.createBrowserRouter).toHaveBeenCalled();
        const routeConfig = getRouteConfig();
        expect(routeConfig).toHaveLength(3); // /, /login, /signup
    });

    it('should configure public routes properly', async () => {
        const routes = getRouteConfig();
        const rootRoute = findRoute(routes, '/');
        expect(rootRoute).toBeDefined();

        // Main Page
        const mainPage = findIndexRoute(rootRoute.children);
        const mainPageLoaded = await mainPage.lazy();
        expect(mainPageLoaded.Component()).toBe('MainPage');

        // Station Detail
        const stationDetail = findRoute(rootRoute.children, 'station/:id');
        const stationDetailLoaded = await stationDetail.lazy();
        expect(stationDetailLoaded.Component()).toBe('StationDetail');

        // Not Found
        const notFound = findRoute(rootRoute.children, '*');
        const notFoundLoaded = await notFound.lazy();
        expect(notFoundLoaded.Component()).toBe('NotFound');
    });

    it('should configure protected routes properly', async () => {
        const routes = getRouteConfig();
        const rootRoute = findRoute(routes, '/');
        
        const protectedWrapper = findComponentRoute(rootRoute.children, 'RequireAuth');
        expect(protectedWrapper).toBeDefined();

        // Profile
        const profile = findRoute(protectedWrapper.children, 'profile');
        const profileLoaded = await profile.lazy();
        expect(profileLoaded.Component()).toBe('Profile');
        expect(profileLoaded.loader()).toBe('profileLoader');
        expect(profileLoaded.action()).toBe('profileAction');

        // Add Car
        const addCar = findRoute(protectedWrapper.children, 'profile/cars/new');
        const addCarLoaded = await addCar.lazy();
        expect(addCarLoaded.Component()).toBe('AddCar');
        expect(addCarLoaded.action()).toBe('addCarAction');

        // Edit Car
        const editCar = findRoute(protectedWrapper.children, 'profile/cars/:carId/edit');
        const editCarLoaded = await editCar.lazy();
        expect(editCarLoaded.Component()).toBe('EditCar');
        expect(editCarLoaded.action()).toBe('editCarAction');
    });

    it('should configure admin routes properly', async () => {
        const routes = getRouteConfig();
        const rootRoute = findRoute(routes, '/');
        const protectedWrapper = findComponentRoute(rootRoute.children, 'RequireAuth');
        
        const adminWrapper = findComponentRoute(protectedWrapper.children, 'RequireAdmin');
        expect(adminWrapper).toBeDefined();

        // Admin Dashboard
        const adminDash = findRoute(adminWrapper.children, 'admin');
        const adminDashLoaded = await adminDash.lazy();
        expect(adminDashLoaded.Component()).toBe('Admin');

        // Add Station
        const addStation = findRoute(adminWrapper.children, 'admin/stations/new');
        const addStationLoaded = await addStation.lazy();
        expect(addStationLoaded.Component()).toBe('AddStation');
        expect(addStationLoaded.action()).toBe('addStationAction');

        // Edit Station
        const editStation = findRoute(adminWrapper.children, 'admin/stations/:stationId/edit');
        const editStationLoaded = await editStation.lazy();
        expect(editStationLoaded.Component()).toBe('EditStation');
        expect(editStationLoaded.action()).toBe('editStationAction');

        // Add User
        const addUser = findRoute(adminWrapper.children, 'admin/users/new');
        const addUserLoaded = await addUser.lazy();
        expect(addUserLoaded.Component()).toBe('AddUser');
        expect(addUserLoaded.action()).toBe('addUserAction');
    });

    it('should configure auth routes (login/signup) properly', async () => {
        const routes = getRouteConfig();
        
        // Login
        const loginRoute = findRoute(routes, '/login');
        expect(loginRoute).toBeDefined();
        expect(loginRoute.Component()).toBe('RedirectIfAuth');
        
        const loginPage = findIndexRoute(loginRoute.children);
        const loginPageLoaded = await loginPage.lazy();
        expect(loginPageLoaded.Component()).toBe('Login');
        expect(loginPageLoaded.action()).toBe('loginAction');

        // Signup
        const signupRoute = findRoute(routes, '/signup');
        expect(signupRoute).toBeDefined();
        expect(signupRoute.Component()).toBe('RedirectIfAuth');

        const signupPage = findIndexRoute(signupRoute.children);
        const signupPageLoaded = await signupPage.lazy();
        expect(signupPageLoaded.Component()).toBe('Signup');
        expect(signupPageLoaded.action()).toBe('signupAction');
    });
});
