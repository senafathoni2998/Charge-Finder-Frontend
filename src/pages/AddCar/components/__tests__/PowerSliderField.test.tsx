import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PowerSliderField from '../PowerSliderField';

describe('PowerSliderField', () => {
    const mockChange = vi.fn();
    const props = {
        value: 50,
        onChange: mockChange,
        min: 0,
        max: 200,
        step: 10,
    };

    it('should render label and value', () => {
        render(<PowerSliderField {...props} />);
        
        expect(screen.getByText('Preferred minimum power')).toBeInTheDocument();
        expect(screen.getByText('50 kW')).toBeInTheDocument();
    });

    it('should handle zero value safely', () => {
        render(<PowerSliderField {...props} value={0} />);
        expect(screen.getByText('0 kW')).toBeInTheDocument();
    });
    
    it('should handle invalid value by defaulting to 0 display', () => {
         render(<PowerSliderField {...props} value={NaN} />);
         expect(screen.getByText('0 kW')).toBeInTheDocument();
    });

    it('should call onChange when slider moves', () => {
        render(<PowerSliderField {...props} />);
        
        // Slider inputs are usually range inputs, or accessible via role="slider"
        const slider = screen.getByRole('slider');
        
        // Changing MUI slider is tricky, firing changes on input works if hidden input exists.
        // Or using fireEvent.change
        fireEvent.change(slider, { target: { value: 60 } });
        expect(mockChange).toHaveBeenCalledWith(60);
    });
});
