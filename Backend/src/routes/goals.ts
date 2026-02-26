import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Goal } from '../types';

const router = Router();

// GET /api/goals
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ g: Goal }>(
      'MATCH (g:Goal) RETURN g ORDER BY g.deadline ASC'
    );
    res.json(rows.map((r) => r.g));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /api/goals/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ g: Goal }>(
      'MATCH (g:Goal {id: $id}) RETURN g',
      { id: req.params.id }
    );
    if (!rows[0]) return res.status(404).json({ error: 'Goal not found' });
    res.json(rows[0].g);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// GET /api/goals/:id/contributions
router.get('/:id/contributions', async (req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ t: Record<string, unknown>; contributedAt: string }>(
      `MATCH (t:Transaction)-[r:CONTRIBUTES_TO]->(g:Goal {id: $id})
       RETURN t, r.contributedAt AS contributedAt
       ORDER BY t.date DESC`,
      { id: req.params.id }
    );
    res.json(
      rows.map((r) => ({
        transaction: r.t,
        contributedAt: r.contributedAt ?? r.t.date,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// GET /api/goals/:id/forecast
router.get('/:id/forecast', async (req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ g: Goal }>(
      'MATCH (g:Goal {id: $id}) RETURN g',
      { id: req.params.id }
    );
    if (!rows[0]) return res.status(404).json({ error: 'Goal not found' });

    const goal = rows[0].g;
    const remaining = goal.targetAmount - goal.currentAmount;

    // Average monthly contribution over last 3 months
    const contribRows = await runQuery<{ total: number; months: number }>(
      `MATCH (t:Transaction)-[:CONTRIBUTES_TO]->(g:Goal {id: $id})
       WHERE t.date >= $since
       RETURN sum(t.amount) AS total, 3 AS months`,
      {
        id: req.params.id,
        since: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      }
    );

    const avgMonthly =
      contribRows[0]?.total && contribRows[0].total > 0
        ? Number(contribRows[0].total) / 3
        : 0;

    if (remaining <= 0) {
      return res.json({
        estimatedDate: new Date().toISOString().slice(0, 10),
        requiredMonthlyAmount: 0,
      });
    }

    let estimatedDate: string;
    if (avgMonthly > 0) {
      const monthsNeeded = Math.ceil(remaining / avgMonthly);
      const d = new Date();
      d.setMonth(d.getMonth() + monthsNeeded);
      estimatedDate = d.toISOString().slice(0, 10);
    } else {
      estimatedDate = goal.deadline;
    }

    const deadline = new Date(goal.deadline);
    const now = new Date();
    const monthsUntilDeadline =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth());
    const requiredMonthlyAmount =
      monthsUntilDeadline > 0 ? Math.ceil(remaining / monthsUntilDeadline) : remaining;

    res.json({ estimatedDate, requiredMonthlyAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute forecast' });
  }
});

// POST /api/goals
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Goal, 'id'>;
    const id = uuidv4();
    const rows = await runQuery<{ g: Goal }>(
      `CREATE (g:Goal {
         id: $id, name: $name, type: $type, targetAmount: $targetAmount,
         currentAmount: $currentAmount, deadline: $deadline, riskProfile: $riskProfile
       })
       WITH g
       MATCH (u:User {id: 'user-001'})
       CREATE (u)-[:CONTRIBUTES_TO {transactionHistory: []}]->(g)
       RETURN g`,
      { id, ...body }
    );
    res.status(201).json(rows[0]?.g ?? { id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

export default router;
