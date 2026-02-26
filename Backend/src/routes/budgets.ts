import { Router, Request, Response } from 'express';
import { runQuery } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { BudgetPlan } from '../types';

const router = Router();

// GET /api/budgets
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ b: BudgetPlan }>(
      'MATCH (b:BudgetPlan) RETURN b ORDER BY b.month DESC'
    );
    res.json(rows.map((r) => r.b));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET /api/budgets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rows = await runQuery<{ b: BudgetPlan }>(
      'MATCH (b:BudgetPlan {id: $id}) RETURN b',
      { id: req.params.id }
    );
    if (!rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json(rows[0].b);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// GET /api/budgets/:id/vs-actual
router.get('/:id/vs-actual', async (req: Request, res: Response) => {
  try {
    const budgetRows = await runQuery<{ b: BudgetPlan }>(
      'MATCH (b:BudgetPlan {id: $id}) RETURN b',
      { id: req.params.id }
    );
    if (!budgetRows[0]) return res.status(404).json({ error: 'Budget not found' });

    const budget = budgetRows[0].b;
    const month = budget.month; // YYYY-MM
    const startDate = `${month}-01`;
    const [year, mon] = month.split('-').map(Number);
    const nextMonth = mon === 12 ? `${year + 1}-01` : `${year}-${String(mon + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const categoryFilter = req.query.category as string | undefined;

    // Get actual spending per category for this month.
    // Include both direct transactions AND transactions in subcategories (one level).
    const actualRows = await runQuery<{ categoryName: string; actual: number }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
       ${categoryFilter && categoryFilter !== 'all' ? 'AND (c.name = $categoryFilter OR EXISTS { MATCH (parent:Category {name: $categoryFilter})-[:PARENT_OF]->(c) })' : ''}
       OPTIONAL MATCH (parent:Category)-[:PARENT_OF]->(c)
       RETURN
         CASE WHEN parent IS NOT NULL THEN parent.name ELSE c.name END AS categoryName,
         sum(t.amount) AS actual`,
      { startDate, endDate, categoryFilter: categoryFilter ?? '' }
    );

    const actualMap = new Map<string, number>(
      actualRows.map((r) => [r.categoryName, Number(r.actual)])
    );

    type BudgetPlanCategory = { category: string; budgetAmount: number };
    const categories: BudgetPlanCategory[] = (() => {
      const raw = (budget as unknown as Record<string, unknown>).categories;
      if (typeof raw === 'string') return JSON.parse(raw) as BudgetPlanCategory[];
      if (Array.isArray(raw)) return raw as BudgetPlanCategory[];
      return [];
    })();

    const result = categories
      .filter((c) => !categoryFilter || categoryFilter === 'all' || c.category === categoryFilter)
      .map((c) => {
        const planned = c.budgetAmount;
        const actual = actualMap.get(c.category) ?? 0;
        const remaining = planned - actual;
        const percentageUsed = planned > 0 ? (actual / planned) * 100 : 0;
        return {
          category: c.category,
          planned,
          actual,
          remaining,
          percentageUsed: Math.round(percentageUsed * 10) / 10,
        };
      });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute budget vs actual' });
  }
});

// POST /api/budgets
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<BudgetPlan, 'id'>;
    const id = uuidv4();
    const categoriesJson = JSON.stringify(body.categories ?? []);
    const rows = await runQuery<{ b: BudgetPlan }>(
      `CREATE (b:BudgetPlan {id: $id, month: $month, categories: $categories, notes: $notes})
       WITH b
       MATCH (u:User {id: 'user-001'})
       CREATE (u)-[:FOLLOWS_BUDGET {month: $month, adherence: 0}]->(b)
       RETURN b`,
      { id, month: body.month, categories: categoriesJson, notes: body.notes ?? '' }
    );
    const b = rows[0]?.b as unknown as Record<string, unknown>;
    if (b && typeof b.categories === 'string') {
      b.categories = JSON.parse(b.categories as string);
    }
    res.status(201).json(b ?? { id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

export default router;
