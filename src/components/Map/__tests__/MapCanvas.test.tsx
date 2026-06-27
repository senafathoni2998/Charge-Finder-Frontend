import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapCanvas from '../MapCanvas';

// Mock react-leaflet. The map is zoomed in (18) and given a small bbox so that
// supercluster renders the test stations as individual markers (not clusters).
const mockMap = {
  fitBounds: vi.fn(),
  setView: vi.fn(),
  getZoom: () => 18,
  getCenter: () => ({ lat: 1.5, lng: 1.5 }),
  getBounds: () => ({
    getWest: () => -10,
    getSouth: () => -10,
    getEast: () => 10,
    getNorth: () => 10,
  }),
};

vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    CircleMarker: ({ children, eventHandlers }: any) => (
      <div data-testid="circle-marker" onClick={eventHandlers?.click}>
        {children}
      </div>
    ),
    Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
    useMap: () => mockMap,
    useMapEvents: () => mockMap,
  };
});

describe('MapCanvas', () => {
  const defaultProps = {
    stations: [],
    bounds: { minLat: 0, maxLat: 10, minLng: 0, maxLng: 10 },
    selectedId: null,
    onSelect: vi.fn(),
    userLoc: null,
  };

  it('should render map container and tiles', () => {
    render(<MapCanvas {...defaultProps} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('should render stations', () => {
    const stations: any = [
      { id: '1', name: 'Station 1', lat: 1, lng: 1, status: 'AVAILABLE' },
      { id: '2', name: 'Station 2', lat: 2, lng: 2, status: 'BUSY', isChargingHere: true },
    ];
    render(<MapCanvas {...defaultProps} stations={stations} />);
    // Check for markers.
    // Logic:
    // Station 1: 1 Marker (status) + 1 Core (interaction) = 2 markers
    // Station 2: 1 Halo (charging) + 1 Marker (status) + 1 Core (interaction) = 3 markers
    // Total markers = 5
    // userLoc is null.
    expect(screen.getAllByTestId('circle-marker')).toHaveLength(5);
  });

  it('should render user location', () => {
    const userLoc = { lat: 5, lng: 5 };
    render(<MapCanvas {...defaultProps} userLoc={userLoc} />);
    // User loc renders two markers (halo + core).
    expect(screen.getAllByTestId('circle-marker')).toHaveLength(2);
  });

  it('should call onSelect when a station marker is clicked', () => {
    const stations: any = [
        { id: '1', name: 'Station 1', lat: 1, lng: 1, status: 'AVAILABLE' },
    ];
    render(<MapCanvas {...defaultProps} stations={stations} />);
    
    // The core marker has the event handler. In mock, it's just the div.
    // We have 2 markers for this station. The last one is the core interactive one in the loop.
    // Implementation: CircleMarker (color), CircleMarker (core + events).
    // So distinct markers.
    
    // Let's find all markers and click the last one which corresponds to the core with click handler.
    const markers = screen.getAllByTestId('circle-marker');
    const interactiveMarker = markers[markers.length - 1]; 
    
    fireEvent.click(interactiveMarker);
    expect(defaultProps.onSelect).toHaveBeenCalledWith('1');
  });
});
