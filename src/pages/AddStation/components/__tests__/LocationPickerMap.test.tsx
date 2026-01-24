import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationPickerMap from '../LocationPickerMap';
import { useMapEvents, useMap } from 'react-leaflet';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: any) => <div>{children}</div>,
    TileLayer: () => <div>TileLayer</div>,
    CircleMarker: () => <div>CircleMarker</div>,
    useMap: vi.fn(),
    useMapEvents: vi.fn(),
}));

describe('LocationPickerMap', () => {
    const mockPick = vi.fn();
    const center = { lat: 10, lng: 20 };
    
    it('should render map components', () => {
        (useMap as any).mockReturnValue({ setView: vi.fn(), getZoom: vi.fn() });
        (useMapEvents as any).mockImplementation((handlers: any) => { return null; });
        
        render(<LocationPickerMap center={center} onPick={mockPick} />);
        
        expect(screen.getByText('TileLayer')).toBeInTheDocument();
    });

    it('should update view on center change', () => {
        const setView = vi.fn();
        const getZoom = vi.fn().mockReturnValue(13);
        (useMap as any).mockReturnValue({ setView, getZoom });
        
        const { rerender } = render(<LocationPickerMap center={center} onPick={mockPick} />);
        
        // Initial render calls setView via LocationUpdater effect
        expect(setView).toHaveBeenCalledWith([10, 20], 13, { animate: false });
        
        rerender(<LocationPickerMap center={{ lat: 30, lng: 40 }} onPick={mockPick} />);
        expect(setView).toHaveBeenCalledWith([30, 40], 13, { animate: false });
    });

    it('should handle click', () => {
        // useMapEvents implementation simulation
        let clickHandler: any;
        (useMapEvents as any).mockImplementation((handlers: any) => {
            if (handlers.click) clickHandler = handlers.click;
            return null;
        });
        
        render(<LocationPickerMap center={center} onPick={mockPick} />);
        
        // Configure logic is inside LocationClickHandler
        // To test it, we need to inspect useMapEvents calls or simulating the hook
        // Since we mocked useMapEvents, we can just call the captured handler
        expect(clickHandler).toBeDefined();
        clickHandler({ latlng: { lat: 50, lng: 60 } });
        
        expect(mockPick).toHaveBeenCalledWith(50, 60);
    });

    it('should render marker if selected', () => {
        render(<LocationPickerMap center={center} selected={{ lat: 10, lng: 20 }} />);
        expect(screen.getByText('CircleMarker')).toBeInTheDocument();
    });
});
