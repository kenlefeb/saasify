import { describe, it, expect } from 'vitest';
import { isRenewalImminent } from './renewalAlerts';
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

describe('isRenewalImminent', () => {
  // Use a helper that builds a YYYY-MM-DD string relative to a reference date,
  // avoiding timezone-related parsing issues.
  const refDate = new Date(2025, 6, 10); // July 10, 2025 (local time)

  function dateStr(daysOffset: number): string {
    const d = new Date(refDate);
    d.setDate(d.getDate() + daysOffset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  it('returns true when renewal is today (0 days)', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(0), status: 'ACTIVE' });
    expect(isRenewalImminent(sub, refDate)).toBe(true);
  });

  it('returns true when renewal is within 7 days (3 days)', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(3), status: 'ACTIVE' });
    expect(isRenewalImminent(sub, refDate)).toBe(true);
  });

  it('returns true when renewal is exactly 7 days away', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(7), status: 'ACTIVE' });
    expect(isRenewalImminent(sub, refDate)).toBe(true);
  });

  it('returns false when renewal is more than 7 days away (8 days)', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(8), status: 'ACTIVE' });
    expect(isRenewalImminent(sub, refDate)).toBe(false);
  });

  it('returns false for PAUSED subscriptions even within 7 days', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(3), status: 'PAUSED' });
    expect(isRenewalImminent(sub, refDate)).toBe(false);
  });

  it('returns false when renewal date is in the past', () => {
    const sub = makeSubscription({ nextRenewalDate: dateStr(-1), status: 'ACTIVE' });
    expect(isRenewalImminent(sub, refDate)).toBe(false);
  });
});
