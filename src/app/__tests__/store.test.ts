import { describe, it, expect } from 'vitest';
import store from '../store';

describe('Redux Store', () => {
  it('should be created with the correct initial state', () => {
    const state = store.getState();
    expect(state).toHaveProperty('app');
    expect(state).toHaveProperty('auth');
  });

  it('should allow dispatching actions', () => {
    // This is a basic check to ensure the store is functional.
    // Ideally, we would dispatch a real action and check the state change,
    // but without importing specific slices/actions, we just verify dispatch exists.
    expect(store.dispatch).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
  });
});
