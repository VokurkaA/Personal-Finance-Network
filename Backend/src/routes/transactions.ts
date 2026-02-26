import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function buildTxFilters(query: Record<string, string>): { where: string; params: Record<string, unknown> } {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (query.startDate) {
    conditions.push('t.date >= $startDate');
    params.startDate = query.startDate;
  }
  if (query.endDate) {
    conditions.push('t.date <= $endDate');
    params.endDate = query.endDate;
  }
  if (query.category) {
    conditions.push('cat.name = $category');
    params.category = query.category;
  }
  if (query.accountId) {
    conditions.push('(fa.id = $accountId OR ta.id = $accountId)');
    params.accountId = query.accountId;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

const TX_RETURN = `
  RETURN t {
    .*,
    fromAccount: fa.id,
    toAccount: ta.id,
    merchant: m.id,
    category: cat.name,
    categoryConfidence: r_cat.confidence
  } AS tx
  ORDER BY t.date DESC
`;

const TX_MATCH_BASE = `
  MATCH (t:Transaction)
  OPTIONAL MATCH (t)-[:FROM]->(fa:Account)
  OPTIONAL MATCH (t)-[:TO]->(ta:Account)
  OPTIONAL MATCH (t)-[:SPENT_AT]->(m:Merchant)
  OPTIONAL MATCH (t)-[r_cat:CATEGORIZED_AS]->(cat:Category)
`;

// GET /api/transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { where, params } = buildTxFilters(req.query as Record<string, string>);
    const cypher = `${TX_MATCH_BASE} ${where} ${TX_RETURN}`;
    const rows = await runQuery<{ tx: Transaction }>(cypher, params);
    res.json(rows.map((r) => r.tx));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ tx: Transaction }>(
      `${TX_MATCH_BASE} WHERE t.id = $id ${TX_RETURN}`,
      { id: req.params.id }
    );
    if (!rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0].tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// POST /api/transactions
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Transaction, 'id'>;
    const id = uuidv4();
    await runQuery(
      `CREATE (t:Transaction {
         id: $id, date: $date, amount: $amount, description: $description,
         type: $type, status: $status, metadata: $metadata
       })
       WITH t
       OPTIONAL MATCH (fa:Account {id: $fromAccount})
       FOREACH (_ IN CASE WHEN fa IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:FROM {date: $date}]->(fa))
       WITH t
       OPTIONAL MATCH (ta:Account {id: $toAccount})
       FOREACH (_ IN CASE WHEN ta IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:TO]->(ta))
       WITH t
       OPTIONAL MATCH (m:Merchant {id: $merchant})
       FOREACH (_ IN CASE WHEN m IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:SPENT_AT {mcc: '', timestamp: $date}]->(m))
       WITH t
       OPTIONAL MATCH (c:Category {name: $category})
       FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:CATEGORIZED_AS {confidence: 1.0}]->(c))`,
      {
        id,
        date: body.date,
        amount: body.amount,
        description: body.description,
        type: body.type,
        status: body.status,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
        fromAccount: body.fromAccount ?? null,
        toAccount: body.toAccount ?? null,
        merchant: body.merchant ?? null,
        category: body.category ?? null,
      }
    );

    const rows = await runQuery<{ tx: Transaction }>(
      `${TX_MATCH_BASE} WHERE t.id = $id ${TX_RETURN}`,
      { id }
    );
    res.status(201).json(rows[0]?.tx ?? { id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// POST /api/transactions/import  (CSV)
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CSV import failed' });
  }
});

export default router;
