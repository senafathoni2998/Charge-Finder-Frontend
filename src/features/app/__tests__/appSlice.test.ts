import { describe, it, expect } from 'vitest';
import appReducer, { setSidebarOpen, setMdMode } from '../appSlice';

describe('appSlice', () => {
  const initialState = {
    isSidebarOpen: true,
    isMdMode: false,
  };

  it('should handle initial state', () => {
    expect(appReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSidebarOpen', () => {
    const actual = appReducer(initialState, setSidebarOpen(false));
    expect(actual.isSidebarOpen).toEqual(false);
  });

  it('should handle setMdMode', () => {
    const actual = appReducer(initialState, setMdMode(true));
    expect(actual.isMdMode).toEqual(true);
  });
});
