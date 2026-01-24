import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignupAppBar from '../SignupAppBar';

// Mock the icon
vi.mock('@mui/icons-material/ElectricBolt', () => ({
    default: () => <div data-testid="electric-bolt-icon">ElectricBoltIcon</div>,
}));

describe('SignupAppBar', () => {
    it('should render without crashing', () => {
        render(<SignupAppBar />);
        expect(screen.getByText('ChargeFinder')).toBeInTheDocument();
    });

    it('should render the ChargeFinder title', () => {
        render(<SignupAppBar />);
        expect(screen.getByText('ChargeFinder')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
        render(<SignupAppBar />);
        expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('should render the Light mode chip', () => {
        render(<SignupAppBar />);
        expect(screen.getByText('Light mode')).toBeInTheDocument();
    });

    it('should render the electric bolt icon', () => {
        render(<SignupAppBar />);
        expect(screen.getByTestId('electric-bolt-icon')).toBeInTheDocument();
    });

    it('should render within an AppBar component', () => {
        const { container } = render(<SignupAppBar />);
        const appBar = container.querySelector('.MuiAppBar-root');
        expect(appBar).toBeInTheDocument();
    });

    it('should render within a Toolbar', () => {
        const { container } = render(<SignupAppBar />);
        const toolbar = container.querySelector('.MuiToolbar-root');
        expect(toolbar).toBeInTheDocument();
    });
});
