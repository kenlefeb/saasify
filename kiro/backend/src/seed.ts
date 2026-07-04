import { Subscription } from './models/subscription';

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = new Date();

export const seedData: Subscription[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'GitHub Teams',
    cost: 9.99,
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    // within 7 days — renewal badge will be visible immediately
    nextRenewalDate: addDays(today, 3),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'Slack Pro',
    cost: 12.50,
    billingCycle: 'MONTHLY',
    status: 'PAUSED',
    nextRenewalDate: addDays(today, 30),
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-012345678902',
    name: 'AWS Developer Support',
    cost: 599.00,
    billingCycle: 'ANNUAL',
    status: 'ACTIVE',
    nextRenewalDate: addDays(today, 180),
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-123456789013',
    name: 'Adobe Creative Cloud',
    cost: 659.88,
    billingCycle: 'ANNUAL',
    status: 'PAUSED',
    nextRenewalDate: addDays(today, 90),
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-234567890124',
    name: 'Figma Organization',
    cost: 45.00,
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    nextRenewalDate: addDays(today, 15),
  },
  {
    id: 'f6a7b8c9-d0e1-2345-fabc-345678901235',
    name: 'Datadog APM',
    cost: 1188.00,
    billingCycle: 'ANNUAL',
    status: 'ACTIVE',
    nextRenewalDate: addDays(today, 5),
  },
];
