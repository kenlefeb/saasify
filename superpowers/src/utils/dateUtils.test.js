import { describe, it, expect } from 'vitest';
import { getDaysDifference, isRenewalImminent } from './dateUtils';

describe('Date Utilities', () => {
  it('calculates differences in days correctly', () => {
    expect(getDaysDifference('2026-07-03', '2026-07-10')).toBe(7);
    expect(getDaysDifference('2026-07-03', '2026-07-02')).toBe(-1);
    expect(getDaysDifference('2026-07-03', '2026-07-03')).toBe(0);
  });

  it('determines if renewal is imminent (within 0 to 7 days)', () => {
    // 7 days away -> imminent
    expect(isRenewalImminent('2026-07-10', '2026-07-03')).toBe(true);
    // 0 days away (today) -> imminent
    expect(isRenewalImminent('2026-07-03', '2026-07-03')).toBe(true);
    // 8 days away -> not imminent
    expect(isRenewalImminent('2026-07-11', '2026-07-03')).toBe(false);
    // -1 days away (past due) -> not imminent (but past due)
    expect(isRenewalImminent('2026-07-02', '2026-07-03')).toBe(false);
  });
});
