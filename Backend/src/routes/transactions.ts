import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../services/transactionService';
import { transactionSchema, transactionQuerySchema } from '../schemas/transactions';
import { AppError } from '../middleware/error';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/transactions
router.get('/', async (req: Request, res: Response) => {
  const query = transactionQuerySchema.parse(req.query);
  const transactions = await TransactionService.getAll(query);
  res.json(transactions);
});

// GET /api/transactions/:id
router.get('/:id', async (req: Request, res: Response) => {
  const transaction = await TransactionService.getById(req.params.id as string);
  if (!transaction) throw new AppError(404, 'Transaction not found');
  res.json(transaction);
});

// POST /api/transactions
router.post('/', async (req: Request, res: Response) => {
  const body = transactionSchema.parse(req.body);
  const transaction = await TransactionService.create(body);
  res.status(201).json(transaction);
});

// POST /api/transactions/import (CSV)
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(400, 'No file uploaded');

  const records = parse(req.file.buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  let imported = 0;
  for (const row of records) {
    const id = uuidv4();
    await runQuery(
      `MERGE (t:Transaction {id: $id})
       SET t.date = $date, t.amount = $amount, t.description = $description,
           t.type = $type, t.status = $status
       WITH t
       OPTIONAL MATCH (c:Category {name: $category})
       FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END |
         MERGE (t)-[r:CATEGORIZED_AS]->(c) SET r.confidence = 0.7
       )`,
      {
        id,
        date: row.date ?? new Date().toISOString().slice(0, 10),
        amount: parseFloat(row.amount ?? '0'),
        description: row.description ?? '',
        type: row.type ?? 'expense',
        status: row.status ?? 'completed',
        category: row.category ?? null,
      }
    );
    imported++;
  }

  res.json({ imported });
});

export default router;
