import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SubscriptionTable from './SubscriptionTable';

describe('SubscriptionTable & AlertBadge', () => {
  const mockContext = {
    subscriptions: [
      { id: '1', name: 'Netflix', cost: 15.00, billingCycle: 'MONTHLY', status: 'ACTIVE', nextRenewalDate: '2026-07-05' },
      { id: '2', name: 'AWS', cost: 1200.00, billingCycle: 'ANNUAL', status: 'ACTIVE', nextRenewalDate: '2026-08-01' }
    ],
    currentUser: 'ADMIN',
    currentSystemDate: '2026-07-03',
    deleteSubscription: vi.fn()
  };

  it('renders subscriptions and action items for ADMIN', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionTable onOpenModal={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    // Netflix has renewal 2026-07-05 which is 2 days from 2026-07-03. Should show "Renewal Imminent"
    expect(screen.getByText('Renewal Imminent')).toBeInTheDocument();

    // Since role is ADMIN, edit/delete actions should exist
    expect(screen.getAllByRole('button', { name: /edit/i }).length).toBe(2);
    expect(screen.getAllByRole('button', { name: /delete/i }).length).toBe(2);
  });

  it('hides edit/delete/add controls for VIEWER', () => {
    const viewerContext = { ...mockContext, currentUser: 'VIEWER' };
    render(
      <SubscriptionContext.Provider value={viewerContext}>
        <SubscriptionTable onOpenModal={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    // VIEWER must not see action keys or add buttons
    expect(screen.queryByRole('button', { name: /add subscription/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
