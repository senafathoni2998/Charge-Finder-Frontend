import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditCarLayout from '../EditCarLayout';

describe('EditCarLayout', () => {
    it('should render children correctly', () => {
        render(
            <EditCarLayout>
                <div>Child Content</div>
            </EditCarLayout>
        );

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <EditCarLayout>
                <div>First Child</div>
                <div>Second Child</div>
                <div>Third Child</div>
            </EditCarLayout>
        );

        expect(screen.getByText('First Child')).toBeInTheDocument();
        expect(screen.getByText('Second Child')).toBeInTheDocument();
        expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('should render within a Box with correct container', () => {
        const { container } = render(
            <EditCarLayout>
                <div>Content</div>
            </EditCarLayout>
        );

        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
        expect(box).toBeVisible();
    });
});
