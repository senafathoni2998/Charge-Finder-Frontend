import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsGrid from '../StatsGrid';
import EvStationIcon from '@mui/icons-material/EvStation';

describe('StatsGrid', () => {
    const mockStats = [
        { label: 'Stations', value: 42, caption: '38 online', icon: <EvStationIcon data-testid="icon-1" /> },
        { label: 'Users', value: 150, caption: '120 active', icon: <EvStationIcon data-testid="icon-2" /> },
    ];

    it('should render all stats', () => {
        render(<StatsGrid stats={mockStats} />);

        expect(screen.getByText('Stations')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('38 online')).toBeInTheDocument();

        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('120 active')).toBeInTheDocument();
    });

    it('should render icons for each stat', () => {
        render(<StatsGrid stats={mockStats} />);

        expect(screen.getByTestId('icon-1')).toBeInTheDocument();
        expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });

    it('should render empty stats array', () => {
        const { container } = render(<StatsGrid stats={[]} />);

        expect(container).toBeInTheDocument();
    });

    it('should render single stat', () => {
        const singleStat = [mockStats[0]];
        render(<StatsGrid stats={singleStat} />);

        expect(screen.getByText('Stations')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });
});
