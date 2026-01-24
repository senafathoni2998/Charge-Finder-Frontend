import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChargingHistoryCard, { type ChargingHistoryItem } from '../ChargingHistoryCard';

describe('ChargingHistoryCard', () => {
    const mockItems: ChargingHistoryItem[] = [
        {
            id: '1',
            endedAt: 1609459200000,
            outcome: 'COMPLETED',
            stationName: 'Test Station',
            stationAddress: '123 Test St',
            vehicleName: 'Tesla Model 3',
            progressPercent: 100,
            batteryPercentage: 80,
            connectorType: 'CCS2',
        },
        {
            id: '2',
            endedAt: 1609372800000,
            outcome: 'CANCELLED',
            stationName: 'Another Station',
            stationAddress: '456 Test Ave',
            vehicleName: 'Nissan Leaf',
            progressPercent: 50,
            batteryPercentage: 60,
            connectorType: 'CHAdeMO',
        },
    ];

    it('should render the card with title', () => {
        render(<ChargingHistoryCard items={[]} />);
        expect(screen.getByText('Charging history')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
        render(<ChargingHistoryCard items={[]} />);
        expect(screen.getByText('Sessions from the last 3 days.')).toBeInTheDocument();
    });

    it('should render loading skeletons when loading', () => {
        render(<ChargingHistoryCard items={[]} loading={true} />);

        const skeletons = document.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBe(2);
    });

    it('should render error message when error is provided', () => {
        render(<ChargingHistoryCard items={[]} error="Failed to load history" />);

        expect(screen.getByText('Unable to load history')).toBeInTheDocument();
        expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('should render no sessions message when items array is empty', () => {
        render(<ChargingHistoryCard items={[]} />);

        expect(screen.getByText('No recent charging sessions.')).toBeInTheDocument();
        expect(screen.getByText('Your last 3 days of charging will appear here.')).toBeInTheDocument();
    });

    it('should render history items', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Test Station')).toBeInTheDocument();
        expect(screen.getByText('Another Station')).toBeInTheDocument();
    });

    it('should render station address', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('123 Test St')).toBeInTheDocument();
        expect(screen.getByText('456 Test Ave')).toBeInTheDocument();
    });

    it('should render outcome chips', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should render vehicle name', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Vehicle: Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('Vehicle: Nissan Leaf')).toBeInTheDocument();
    });

    it('should render progress percent', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Progress 100%')).toBeInTheDocument();
        expect(screen.getByText('Progress 50%')).toBeInTheDocument();
    });

    it('should render battery percentage', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Battery 80%')).toBeInTheDocument();
        expect(screen.getByText('Battery 60%')).toBeInTheDocument();
    });

    it('should render connector type', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Connector: CCS2')).toBeInTheDocument();
        expect(screen.getByText('Connector: CHAdeMO')).toBeInTheDocument();
    });

    it('should format timestamps correctly', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        const timeElements = screen.getAllByText(/(Jan|Dec)/);
        expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should handle items with null values', () => {
        const nullItems: ChargingHistoryItem[] = [
            {
                id: '1',
                endedAt: null,
                outcome: null,
                stationName: 'Test Station',
                stationAddress: '',
                vehicleName: '',
                progressPercent: null,
                batteryPercentage: null,
                connectorType: null,
            },
        ];

        render(<ChargingHistoryCard items={nullItems} />);

        expect(screen.getByText('Test Station')).toBeInTheDocument();
        expect(screen.getByText('Ended')).toBeInTheDocument();
    });

    it('should handle items with missing optional fields', () => {
        const minimalItems: ChargingHistoryItem[] = [
            {
                id: '1',
                endedAt: 1609459200000,
                outcome: 'COMPLETED',
                stationName: 'Test Station',
                stationAddress: '',
                vehicleName: '',
                progressPercent: null,
                batteryPercentage: null,
                connectorType: null,
            },
        ];

        render(<ChargingHistoryCard items={minimalItems} />);

        expect(screen.getByText('Test Station')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render multiple meta labels', () => {
        render(<ChargingHistoryCard items={mockItems} />);

        expect(screen.getByText('Vehicle: Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('Connector: CCS2')).toBeInTheDocument();
        expect(screen.getByText('Progress 100%')).toBeInTheDocument();
        expect(screen.getByText('Battery 80%')).toBeInTheDocument();
    });
});
