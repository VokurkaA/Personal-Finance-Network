import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Account } from '../types';

const router = Router();

// GET /api/accounts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ a: Record<string, unknown> }>(
      'MATCH (a:Account) RETURN a ORDER BY a.createdAt ASC'
    );
    const accounts: Account[] = rows.map((r) => r.a as unknown as Account);
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// POST /api/accounts
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, balance, bank } = req.body as Omit<Account, 'id' | 'createdAt'>;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const rows = await runQuery<{ a: Record<string, unknown> }>(
      `CREATE (a:Account {id: $id, name: $name, type: $type, balance: $balance, bank: $bank, createdAt: $createdAt})
       WITH a
       MATCH (u:User {id: 'user-001'})
       CREATE (u)-[:HAS {primaryAccount: false}]->(a)
       RETURN a`,
      { id, name, type, balance, bank, createdAt }
    );
    res.status(201).json(rows[0].a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

export default router;
