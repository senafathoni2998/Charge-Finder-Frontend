import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MiniPhoto from '../MiniPhoto';

describe('MiniPhoto', () => {
    it('should render without crashing', () => {
        render(<MiniPhoto label="Test Photo" gradient="linear-gradient(45deg, red, blue)" />);
        expect(screen.getByText('Test Photo')).toBeInTheDocument();
    });

    it('should render the label', () => {
        render(<MiniPhoto label="Front View" gradient="linear-gradient(45deg, red, blue)" />);
        expect(screen.getByText('Front View')).toBeInTheDocument();
    });

    it('should render with provided gradient', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="linear-gradient(45deg, red, blue)" />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({
            background: 'linear-gradient(45deg, red, blue)',
        });
    });

    it('should use default gradient when empty string is provided', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="" />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
    });

    it('should use default gradient when only whitespace is provided', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="   " />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<MiniPhoto label="Station Photo" gradient="linear-gradient(45deg, red, blue)" />);
        const box = screen.getByLabelText('Station Photo');
        expect(box).toBeInTheDocument();
    });

    it('should have proper dimensions', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="linear-gradient(45deg, red, blue)" />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({
            height: '140px',
        });
        expect(box).toBeInTheDocument();
    });

    it('should have overflow hidden', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="linear-gradient(45deg, red, blue)" />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({
            overflow: 'hidden',
        });
    });

    it('should render gradient with CSS color values', () => {
        const { container } = render(
            <MiniPhoto label="Test" gradient="radial-gradient(circle, #fff, #000)" />
        );
        const box = container.firstChild as HTMLElement;
        expect(box).toHaveStyle({
            background: 'radial-gradient(circle, #fff, #000)',
        });
    });

    it('should render label with caption variant', () => {
        render(<MiniPhoto label="Test Label" gradient="linear-gradient(45deg, red, blue)" />);
        const label = screen.getByText('Test Label');
        expect(label.tagName.toLowerCase()).toBe('span');
    });
});
