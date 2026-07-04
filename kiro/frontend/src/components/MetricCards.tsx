import React from 'react';
import { Subscription } from '../types';
import { calculateMonthlySpend, countActive, formatUSD } from '../utils/calculations';

interface MetricCardsProps {
  subscriptions: Subscription[];
}

const MetricCards: React.FC<MetricCardsProps> = ({ subscriptions }) => {
  const monthlySpend = calculateMonthlySpend(subscriptions);
  const activeCount = countActive(subscriptions);
  return (
    <div className="metric-cards">
      <div className="metric-card">
        <h2>Total Projected Monthly Spend</h2>
        <p>{formatUSD(monthlySpend)}</p>
      </div>
      <div className="metric-card">
        <h2>Active Subscriptions</h2>
        <p>{activeCount}</p>
      </div>
    </div>
  );
};

export default MetricCards;
