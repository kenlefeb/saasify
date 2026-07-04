import { z } from 'zod';

export const SubscriptionSchema = z.object({
  name: z.string().min(1),
  cost: z.number().nonnegative().multipleOf(0.01),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
  status: z.enum(['ACTIVE', 'PAUSED']),
  nextRenewalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type Subscription = z.infer<typeof SubscriptionSchema> & { id: string };
