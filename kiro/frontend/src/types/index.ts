export type Role = 'ADMIN' | 'VIEWER';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type Status = 'ACTIVE' | 'PAUSED';

export interface User {
  id: string;       // UUID v4
  name: string;
  role: Role;
}

export interface Subscription {
  id: string;              // UUID v4
  name: string;
  cost: number;            // stored as decimal, 2 decimal places
  billingCycle: BillingCycle;
  status: Status;
  nextRenewalDate: string; // YYYY-MM-DD format
}
