import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../hooks';
import appReducer from '../../features/app/appSlice'; // Import your actual reducers
import authReducer from '../../features/auth/authSlice';

// Create a mock store for testing
const createMockStore = () => configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
});

describe('Redux Hooks', () => {
  it('useAppDispatch should return the dispatch function', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('function');
  });

  it('useAppSelector should select state correctly', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    // Assuming initial state of app slice has a property we can check, 
    // or just checking the root state structure availability.
    const { result } = renderHook(() => useAppSelector((state) => state), { wrapper });
    
    expect(result.current).toHaveProperty('app');
    expect(result.current).toHaveProperty('auth');
  });
});
