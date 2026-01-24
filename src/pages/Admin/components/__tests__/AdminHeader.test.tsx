import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminHeader from '../AdminHeader';

describe('AdminHeader', () => {
    it('should render header content', () => {
        render(<AdminHeader onAddStation={vi.fn()} onInviteUser={vi.fn()} />);

        expect(screen.getByText('Admin Control Center')).toBeInTheDocument();
        expect(screen.getByText(/Manage stations, users, and operational health/)).toBeInTheDocument();
    });

    it('should render role chip', () => {
        render(<AdminHeader onAddStation={vi.fn()} onInviteUser={vi.fn()} />);

        expect(screen.getByText('Role: Admin')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
        render(<AdminHeader onAddStation={vi.fn()} onInviteUser={vi.fn()} />);

        expect(screen.getByText('Add station')).toBeInTheDocument();
        expect(screen.getByText('Invite user')).toBeInTheDocument();
    });

    it('should call onAddStation when Add station button is clicked', () => {
        const onAddStation = vi.fn();
        render(<AdminHeader onAddStation={onAddStation} onInviteUser={vi.fn()} />);

        fireEvent.click(screen.getByText('Add station'));
        expect(onAddStation).toHaveBeenCalledTimes(1);
    });

    it('should call onInviteUser when Invite user button is clicked', () => {
        const onInviteUser = vi.fn();
        render(<AdminHeader onAddStation={vi.fn()} onInviteUser={onInviteUser} />);

        fireEvent.click(screen.getByText('Invite user'));
        expect(onInviteUser).toHaveBeenCalledTimes(1);
    });
});
