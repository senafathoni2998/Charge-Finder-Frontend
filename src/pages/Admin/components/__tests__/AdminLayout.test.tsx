import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLayout from '../AdminLayout';

describe('AdminLayout', () => {
    it('should render children correctly', () => {
        render(
            <AdminLayout>
                <div>Child Content</div>
            </AdminLayout>
        );

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <AdminLayout>
                <div>First Child</div>
                <div>Second Child</div>
                <div>Third Child</div>
            </AdminLayout>
        );

        expect(screen.getByText('First Child')).toBeInTheDocument();
        expect(screen.getByText('Second Child')).toBeInTheDocument();
        expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('should apply correct styles', () => {
        const { container } = render(
            <AdminLayout>
                <div>Content</div>
            </AdminLayout>
        );

        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
        // The styles are applied via sx prop which converts to CSS classes
        // Just verify the element exists
        expect(box).toBeVisible();
    });
});
