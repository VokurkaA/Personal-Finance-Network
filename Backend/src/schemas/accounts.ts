import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['checking', 'savings', 'investment', 'crypto']),
  balance: z.number(),
  bank: z.string().min(1),
});
