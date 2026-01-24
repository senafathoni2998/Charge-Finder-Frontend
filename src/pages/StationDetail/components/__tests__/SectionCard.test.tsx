import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionCard from '../SectionCard';

describe('SectionCard', () => {
    it('should render without crashing', () => {
        render(
            <SectionCard title="Test Title">
                <div>Test Content</div>
            </SectionCard>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render the title', () => {
        render(
            <SectionCard title="Connectors">
                <div>Content</div>
            </SectionCard>
        );
        expect(screen.getByText('Connectors')).toBeInTheDocument();
    });

    it('should render the subtitle when provided', () => {
        render(
            <SectionCard title="Connectors" subtitle="Available charging ports">
                <div>Content</div>
            </SectionCard>
        );
        expect(screen.getByText('Available charging ports')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
        render(
            <SectionCard title="Connectors">
                <div>Content</div>
            </SectionCard>
        );
        expect(screen.queryByText('Available charging ports')).not.toBeInTheDocument();
    });

    it('should render children content', () => {
        render(
            <SectionCard title="Test">
                <div>Child Content</div>
            </SectionCard>
        );
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render right element when provided', () => {
        render(
            <SectionCard title="Test" right={<button>Action</button>}>
                <div>Content</div>
            </SectionCard>
        );
        expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render within a Card component', () => {
        const { container } = render(
            <SectionCard title="Test">
                <div>Content</div>
            </SectionCard>
        );
        const card = container.querySelector('.MuiCard-root');
        expect(card).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <SectionCard title="Test">
                <div>Child 1</div>
                <div>Child 2</div>
                <div>Child 3</div>
            </SectionCard>
        );
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
});
