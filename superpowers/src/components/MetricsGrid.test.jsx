import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import MetricsGrid from './MetricsGrid';

describe('MetricsGrid Component', () => {
  const mockContext = {
    totalProjectedMonthlySpend: 245.50,
    activeSubscriptionsCount: 4,
  };

  it('renders projected spend and active counts accurately', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <MetricsGrid />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Total Projected Monthly Spend')).toBeInTheDocument();
    expect(screen.getByText('$245.50')).toBeInTheDocument();
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
