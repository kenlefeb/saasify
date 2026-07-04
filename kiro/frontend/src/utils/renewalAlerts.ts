import { Subscription } from '../types';

export const isRenewalImminent = (
  subscription: Subscription,
  today: Date = new Date()
): boolean => {
  if (subscription.status !== 'ACTIVE') return false;
  // Parse YYYY-MM-DD directly to avoid UTC vs local timezone issues
  const [year, month, day] = subscription.nextRenewalDate.split('-').map(Number);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const renewalMidnight = new Date(year, month - 1, day);
  const diffMs = renewalMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};
