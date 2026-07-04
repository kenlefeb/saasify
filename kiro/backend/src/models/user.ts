import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'VIEWER']),
});

export type User = z.infer<typeof UserSchema> & { id: string };
