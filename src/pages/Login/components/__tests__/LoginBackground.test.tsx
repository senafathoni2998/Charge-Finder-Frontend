import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoginBackground from '../LoginBackground';

describe('LoginBackground', () => {
    it('should render without crashing', () => {
        const { container } = render(<LoginBackground />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should render the background container with aria-hidden', () => {
        const { container } = render(<LoginBackground />);

        const backgroundContainer = container.querySelector('[aria-hidden="true"]');
        expect(backgroundContainer).toBeInTheDocument();
    });
});
