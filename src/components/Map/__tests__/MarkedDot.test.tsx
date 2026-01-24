import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkedDot from '../MarkedDot';

describe('MarkedDot', () => {
    const defaultProps = {
        x: 0.5,
        y: 0.5,
        color: '#ff0000',
        label: 'Test Dot',
        onClick: vi.fn(),
    };

    it('should render and handle click', () => {
        render(<MarkedDot {...defaultProps} />);
        
        const dot = screen.getByRole('button');
        expect(dot).toBeInTheDocument();
        
        fireEvent.click(dot);
        expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('should show tooltip on hover (implicitly via title check)', () => {
         render(<MarkedDot {...defaultProps} />);
         // MUI Tooltip adds aria-label to the child if title is string
         expect(screen.getByLabelText(defaultProps.label)).toBeInTheDocument();
    });

    it('should handle keyboard enter', () => {
        // Create fresh mock for this test to avoid count contamination
        const onClick = vi.fn();
        render(<MarkedDot {...defaultProps} onClick={onClick} />);
        const dot = screen.getByRole('button');
        fireEvent.keyDown(dot, { key: 'Enter', code: 'Enter' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
