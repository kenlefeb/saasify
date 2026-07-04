import { Subscription } from '../types';

export const calculateMonthlySpend = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((total, s) => {
      const monthly = s.billingCycle === 'ANNUAL' ? s.cost / 12 : s.cost;
      return total + monthly;
    }, 0);
};

export const countActive = (subscriptions: Subscription[]): number =>
  subscriptions.filter(s => s.status === 'ACTIVE').length;

export const formatUSD = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
