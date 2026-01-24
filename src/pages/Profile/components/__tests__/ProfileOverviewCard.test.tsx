import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileOverviewCard from '../ProfileOverviewCard';

// Mock the Form component to avoid router context issues
vi.mock('react-router', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router');
    return {
        ...actual,
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe('ProfileOverviewCard', () => {
    const defaultProps = {
        displayName: 'John Doe',
        email: 'john@example.com',
        regionLabel: 'Jakarta, ID',
        initials: 'JD',
        avatarUrl: null,
        onEditProfile: vi.fn(),
        onChangePassword: vi.fn(),
    };

    it('should render the profile card', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the email', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        const emailElements = screen.getAllByText('john@example.com');
        expect(emailElements.length).toBeGreaterThan(0);
    });

    it('should render demo email when email is null', () => {
        render(<ProfileOverviewCard {...defaultProps} email={null} />);
        const emailElements = screen.getAllByText('demo@chargefinder.app');
        expect(emailElements.length).toBe(2);
    });

    it('should render the Active chip', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render the initials in avatar when no avatar url', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render the profile details', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Plan')).toBeInTheDocument();
        expect(screen.getByText('Region')).toBeInTheDocument();
    });

    it('should render the plan label', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Driver • Free')).toBeInTheDocument();
    });

    it('should render the Edit profile button', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Edit profile')).toBeInTheDocument();
    });

    it('should call onEditProfile when Edit profile button is clicked', () => {
        const onEditProfile = vi.fn();
        render(<ProfileOverviewCard {...defaultProps} onEditProfile={onEditProfile} />);
        const editButton = screen.getByText('Edit profile');
        fireEvent.click(editButton);
        expect(onEditProfile).toHaveBeenCalledTimes(1);
    });

    it('should render the Change password button', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('should call onChangePassword when Change password button is clicked', () => {
        const onChangePassword = vi.fn();
        render(<ProfileOverviewCard {...defaultProps} onChangePassword={onChangePassword} />);
        const changePasswordButton = screen.getByText('Change password');
        fireEvent.click(changePasswordButton);
        expect(onChangePassword).toHaveBeenCalledTimes(1);
    });

    it('should render the Sign out button', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('should have a logout form with hidden intent input', () => {
        render(<ProfileOverviewCard {...defaultProps} />);
        const intentInput = document.querySelector('input[name="intent"]');
        expect(intentInput).toBeInTheDocument();
        expect((intentInput as HTMLInputElement).value).toBe('logout');
    });
});
