import { describe, it, expect } from 'vitest';
import { calculateMonthlySpend, countActive, formatUSD } from './calculations';
import { Subscription } from '../types';

const makeSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'test-id',
  name: 'Test',
  cost: 10,
  billingCycle: 'MONTHLY',
  status: 'ACTIVE',
  nextRenewalDate: '2025-08-01',
  ...overrides,
});

describe('calculateMonthlySpend', () => {
  it('returns 0 for empty array', () => {
    expect(calculateMonthlySpend([])).toBe(0);
  });

  it('adds MONTHLY cost directly for ACTIVE subscriptions', () => {
    const subs = [makeSubscription({ cost: 10 }), makeSubscription({ cost: 20 })];
    expect(calculateMonthlySpend(subs)).toBe(30);
  });

  it('divides ANNUAL cost by 12 for ACTIVE subscriptions', () => {
    const subs = [makeSubscription({ cost: 120, billingCycle: 'ANNUAL' })];
    expect(calculateMonthlySpend(subs)).toBe(10);
  });

  it('excludes PAUSED subscriptions', () => {
    const subs = [
      makeSubscription({ cost: 10, status: 'ACTIVE' }),
      makeSubscription({ cost: 50, status: 'PAUSED' }),
    ];
    expect(calculateMonthlySpend(subs)).toBe(10);
  });

  it('combines MONTHLY and ANNUAL correctly', () => {
    const subs = [
      makeSubscription({ cost: 10, billingCycle: 'MONTHLY', status: 'ACTIVE' }),
      makeSubscription({ cost: 120, billingCycle: 'ANNUAL', status: 'ACTIVE' }),
    ];
    expect(calculateMonthlySpend(subs)).toBe(20);
  });
});

describe('countActive', () => {
  it('returns 0 for empty array', () => {
    expect(countActive([])).toBe(0);
  });

  it('counts only ACTIVE subscriptions', () => {
    const subs = [
      makeSubscription({ status: 'ACTIVE' }),
      makeSubscription({ status: 'PAUSED' }),
      makeSubscription({ status: 'ACTIVE' }),
    ];
    expect(countActive(subs)).toBe(2);
  });
});

describe('formatUSD', () => {
  it('formats as US currency', () => {
    expect(formatUSD(1234.56)).toBe('$1,234.56');
  });

  it('rounds to two decimal places', () => {
    expect(formatUSD(10)).toBe('$10.00');
  });
});
