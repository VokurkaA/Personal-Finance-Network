import { Router, Request, Response } from 'express';
import { runQuery } from '../db';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ id: string; name: string; type: string; color: string }>(
      'MATCH (c:Category) RETURN c.id as id, c.name as name, c.type as type, c.color as color'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
