import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MapGrid from '../MapGrid';

describe('MapGrid', () => {
    it('should render without crashing', () => {
        const { container } = render(<MapGrid />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
