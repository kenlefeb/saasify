import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionProvider, SubscriptionContext } from './SubscriptionContext';

const TestComponent = () => {
  const {
    currentUser,
    setCurrentUser,
    totalProjectedMonthlySpend,
    activeSubscriptionsCount,
    addSubscription
  } = useContext(SubscriptionContext);

  return (
    <div>
      <span data-testid="user">{currentUser}</span>
      <span data-testid="spend">{totalProjectedMonthlySpend ? totalProjectedMonthlySpend.toFixed(2) : '0.00'}</span>
      <span data-testid="active-count">{activeSubscriptionsCount}</span>
      <button data-testid="add-btn" onClick={() => addSubscription({
        name: 'New Sub',
        cost: 120.00,
        billingCycle: 'ANNUAL',
        status: 'ACTIVE',
        nextRenewalDate: '2026-07-15'
      })}>Add</button>
      <button data-testid="change-user" onClick={() => setCurrentUser('VIEWER')}>Viewer</button>
    </div>
  );
};

describe('SubscriptionContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides default values and calculates spend correctly', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('ADMIN');
    // Pre-seeded: 
    // GitHub Enterprise (Active, Annual, 240/yr = 20/mo)
    // Slack (Active, Monthly, 15/mo)
    // Zoom (Paused, Monthly, 20/mo = 0)
    // Total spend: 20 + 15 = 35.00
    expect(screen.getByTestId('spend')).toHaveTextContent('35.00');
    expect(screen.getByTestId('active-count')).toHaveTextContent('2');
  });

  it('allows ADMIN to add subscriptions and blocks VIEWER from mutating', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );

    // ADMIN can add
    act(() => {
      screen.getByTestId('add-btn').click();
    });
    // New sub is Active, Annual, 120/yr = 10/mo. Spend becomes 35 + 10 = 45
    expect(screen.getByTestId('spend')).toHaveTextContent('45.00');

    // Switch to VIEWER
    act(() => {
      screen.getByTestId('change-user').click();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('VIEWER');

    // Attempting add as VIEWER should not increase spend (mutation blocked)
    act(() => {
      screen.getByTestId('add-btn').click();
    });
    expect(screen.getByTestId('spend')).toHaveTextContent('45.00');
  });

  it('falls back to DEFAULT_SUBSCRIPTIONS if localStorage contains invalid JSON', () => {
    window.localStorage.setItem('saasify_subscriptions', 'invalid-json{');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );

    // Should fall back to DEFAULT_SUBSCRIPTIONS, spend is 35.00
    expect(screen.getByTestId('spend')).toHaveTextContent('35.00');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
