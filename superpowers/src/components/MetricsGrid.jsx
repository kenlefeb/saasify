import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function MetricsGrid() {
  const { totalProjectedMonthlySpend, activeSubscriptionsCount } = useContext(SubscriptionContext);

  const formattedSpend = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalProjectedMonthlySpend);

  return (
    <div className="metrics-row">
      <div className="metric-card">
        <h3>Total Projected Monthly Spend</h3>
        <div className="value gradient-text">{formattedSpend}</div>
      </div>
      <div className="metric-card">
        <h3>Active Subscriptions</h3>
        <div className="value">{activeSubscriptionsCount}</div>
      </div>
    </div>
  );
}
