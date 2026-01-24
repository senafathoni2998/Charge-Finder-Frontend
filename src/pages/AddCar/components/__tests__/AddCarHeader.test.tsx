import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddCarHeader from '../AddCarHeader';

describe('AddCarHeader', () => {
    it('should render default content', () => {
        render(<AddCarHeader />);
        
        expect(screen.getByText('Add a car')).toBeInTheDocument();
        expect(screen.getByText(/Save your connector types/)).toBeInTheDocument();
    });

    it('should render custom content', () => {
        render(<AddCarHeader title="Edit Car" subtitle="Update details" />);
        
        expect(screen.getByText('Edit Car')).toBeInTheDocument();
        expect(screen.getByText('Update details')).toBeInTheDocument();
    });
});
