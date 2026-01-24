import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddUserHeader from '../AddUserHeader';

describe('AddUserHeader', () => {
    it('should render default title', () => {
        render(<AddUserHeader />);
        expect(screen.getByText('Add user')).toBeInTheDocument();
        expect(screen.getByText(/Invite a teammate/)).toBeInTheDocument();
    });

    it('should render custom props', () => {
        render(<AddUserHeader title="New Title" subtitle="Subtitle" />);
        expect(screen.getByText('New Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});
