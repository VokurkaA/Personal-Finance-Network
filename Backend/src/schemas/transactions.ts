import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount: z.number(),
  description: z.string().min(1),
  type: z.enum(['expense', 'income', 'transfer']),
  status: z.enum(['pending', 'completed', 'failed']),
  metadata: z.record(z.string(), z.unknown()).optional(),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  merchant: z.string().optional(),
  category: z.string().optional(),
});

export const transactionQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().optional(),
  accountId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});
