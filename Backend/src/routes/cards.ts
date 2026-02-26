import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Card } from '../types';

const router = Router();

// GET /api/cards
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ c: Record<string, unknown> }>(
      'MATCH (c:Card) RETURN c ORDER BY c.name ASC'
    );
    res.json(rows.map((r) => r.c));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// POST /api/cards
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, lastDigits, limit, linkedAccount } = req.body as Omit<Card, 'id'>;
    const id = uuidv4();
    const rows = await runQuery<{ c: Record<string, unknown> }>(
      `CREATE (c:Card {id: $id, name: $name, type: $type, lastDigits: $lastDigits, limit: $limit, linkedAccount: $linkedAccount})
       WITH c
       MATCH (u:User {id: 'user-001'})
       CREATE (u)-[:OWNS]->(c)
       WITH c
       OPTIONAL MATCH (a:Account {id: $linkedAccount})
       FOREACH (_ IN CASE WHEN a IS NOT NULL THEN [1] ELSE [] END |
         CREATE (a)-[:LINKED_TO]->(c)
       )
       RETURN c`,
      { id, name, type, lastDigits, limit: limit ?? null, linkedAccount }
    );
    res.status(201).json(rows[0].c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

export default router;
