import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditStationLayout from '../EditStationLayout';

describe('EditStationLayout', () => {
    it('should render children correctly', () => {
        render(
            <EditStationLayout>
                <div>Child Content</div>
            </EditStationLayout>
        );

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <EditStationLayout>
                <div>First Child</div>
                <div>Second Child</div>
                <div>Third Child</div>
            </EditStationLayout>
        );

        expect(screen.getByText('First Child')).toBeInTheDocument();
        expect(screen.getByText('Second Child')).toBeInTheDocument();
        expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('should render within a Box with correct container', () => {
        const { container } = render(
            <EditStationLayout>
                <div>Content</div>
            </EditStationLayout>
        );

        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
        expect(box).toBeVisible();
    });
});
