import { Router, Request, Response } from 'express';
import { runQuery } from '../db';

const router = Router();

// ── GET /api/recommendations/savings ────────────────────────────────────────
router.get('/savings', async (_req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const startDate = since.toISOString().slice(0, 10);

    // High-frequency categories (likely subscriptions / daily habits)
    const rows = await runQuery<{
      category: string; totalAmount: number; txCount: number; merchants: string;
    }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $startDate AND t.type = 'expense'
       OPTIONAL MATCH (t)-[:SPENT_AT]->(m:Merchant)
       RETURN c.name AS category,
              sum(t.amount) AS totalAmount,
              count(t) AS txCount,
              collect(DISTINCT coalesce(m.name, ''))[..5] AS merchants`,
      { startDate }
    );

    const recommendations = rows
      .filter((r) => Number(r.txCount) >= 3)
      .map((r) => {
        const total = Number(r.totalAmount);
        const count = Number(r.txCount);
        const avgPerTx = total / count;
        const merchantList = (r.merchants as unknown as string[]).filter(Boolean);

        let suggestion = `You spent ${total.toLocaleString()} in ${r.category} over 3 months (${count} transactions).`;
        let potentialSavings = 0;
        let priority: 'low' | 'medium' | 'high' = 'low';

        if (count >= 15) {
          // Daily habit pattern
          suggestion = `Daily habit detected (${count} transactions, avg ${Math.round(avgPerTx)} per visit). Consider reducing frequency.`;
          potentialSavings = Math.round(total * 0.3);
          priority = 'high';
        } else if (merchantList.length >= 3) {
          suggestion = `Multiple services in ${r.category}: ${merchantList.slice(0, 3).join(', ')}. Check for unused ones.`;
          potentialSavings = Math.round(total * 0.4);
          priority = 'medium';
        } else {
          potentialSavings = Math.round(total * 0.1);
        }

        return {
          title: r.category,
          currentSpending: total,
          services: merchantList.map((name) => ({ name, amount: Math.round(avgPerTx) })),
          suggestion,
          potentialSavings,
          priority,
        };
      })
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 6);

    const totalPotentialSavings = recommendations.reduce((s, r) => s + r.potentialSavings, 0);
    res.json({ recommendations, totalPotentialSavings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute savings recommendations' });
  }
});

// ── GET /api/recommendations/investment ─────────────────────────────────────
router.get('/investment', async (_req: Request, res: Response) => {
  try {
    // Determine user's dominant risk profile from goals
    const goalRows = await runQuery<{ riskProfile: string; count: number }>(
      `MATCH (g:Goal)
       RETURN g.riskProfile AS riskProfile, count(g) AS count
       ORDER BY count DESC LIMIT 1`
    );
    const risk = (goalRows[0]?.riskProfile as string) ?? 'medium';

    // Compute free cashflow (last month income - expenses)
    const now = new Date();
    const lastMonthStart = new Date(now);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const startDate = `${lastMonthStart.getFullYear()}-${String(lastMonthStart.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const cfRows = await runQuery<{ income: number; expenses: number }>(
      `MATCH (t:Transaction)
       WHERE t.date >= $startDate AND t.date < $endDate
       RETURN sum(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS income,
              sum(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expenses`,
      { startDate, endDate }
    );
    const freeCash = Math.max(0, Number(cfRows[0]?.income ?? 0) - Number(cfRows[0]?.expenses ?? 0));

    const RECOMMENDATIONS: Record<string, Array<{
      asset: string; expectedReturn: number; risk: 'low' | 'medium' | 'high'; reason: string;
    }>> = {
      low: [
        { asset: 'Government Bonds', expectedReturn: 4.5, risk: 'low', reason: 'Stable, government-backed return with low volatility.' },
        { asset: 'Money Market Fund', expectedReturn: 3.8, risk: 'low', reason: 'Liquid, low-risk parking of free cash.' },
        { asset: 'High-Yield Savings Account', expectedReturn: 3.2, risk: 'low', reason: 'Instant access with above-average interest.' },
      ],
      medium: [
        { asset: 'S&P 500 Index Fund', expectedReturn: 9.5, risk: 'medium', reason: 'Broad US equity exposure with long-term growth track record.' },
        { asset: 'Global ETF (MSCI World)', expectedReturn: 8.2, risk: 'medium', reason: 'Diversified international exposure reduces country risk.' },
        { asset: 'Corporate Bonds ETF', expectedReturn: 5.5, risk: 'medium', reason: 'Higher yield than government bonds with moderate risk.' },
      ],
      high: [
        { asset: 'Small-Cap Growth ETF', expectedReturn: 14.0, risk: 'high', reason: 'Higher growth potential, suitable for long investment horizons.' },
        { asset: 'Emerging Markets ETF', expectedReturn: 12.5, risk: 'high', reason: 'High-growth economies with significant upside potential.' },
        { asset: 'Individual Tech Stocks', expectedReturn: 18.0, risk: 'high', reason: 'Concentration in high-conviction opportunities.' },
      ],
    };

    const recs = RECOMMENDATIONS[risk] ?? RECOMMENDATIONS.medium;
    res.json(recs.map((r) => ({ ...r, availableCash: freeCash })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute investment recommendations' });
  }
});

// ── GET /api/recommendations/budget-adjustment?category=<name> ──────────────
router.get('/budget-adjustment', async (req: Request, res: Response) => {
  try {
    const categoryFilter = req.query.category as string | undefined;

    // Get current month's budget plans
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budgetRows = await runQuery<{ b: { categories: string | Array<{ category: string; budgetAmount: number }> } }>(
      `MATCH (b:BudgetPlan {month: $month}) RETURN b LIMIT 1`,
      { month: currentMonth }
    );

    if (!budgetRows[0]) {
      return res.json([]);
    }

    const b = budgetRows[0].b;
    type BPC = { category: string; budgetAmount: number };
    const categories: BPC[] = typeof b.categories === 'string'
      ? JSON.parse(b.categories)
      : (b.categories as BPC[]);

    // Get 3-month average actual spending per category
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const startDate = since.toISOString().slice(0, 10);

    const actualRows = await runQuery<{ category: string; total: number }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $startDate AND t.type = 'expense'
       ${categoryFilter ? 'AND (c.name = $categoryFilter OR EXISTS { MATCH (p:Category {name: $categoryFilter})-[:PARENT_OF]->(c) })' : ''}
       OPTIONAL MATCH (parent:Category)-[:PARENT_OF]->(c)
       WITH CASE WHEN parent IS NOT NULL THEN parent.name ELSE c.name END AS category,
            sum(t.amount) AS monthTotal
       RETURN category, monthTotal / 3.0 AS total`,
      { startDate, categoryFilter: categoryFilter ?? '' }
    );

    const actualMap = new Map(actualRows.map((r) => [r.category, Number(r.total)]));

    const suggestions = categories
      .filter((c) => !categoryFilter || c.category === categoryFilter)
      .map((c) => {
        const avgActual = actualMap.get(c.category) ?? 0;
        const diff = avgActual - c.budgetAmount;
        const pctDiff = c.budgetAmount > 0 ? diff / c.budgetAmount : 0;

        let reason = '';
        let suggestedBudget = c.budgetAmount;

        if (pctDiff > 0.15) {
          suggestedBudget = Math.ceil(avgActual * 1.1); // 10% buffer above actual
          reason = `Consistently ${Math.round(pctDiff * 100)}% over budget for 3 months. Suggest increasing to match reality.`;
        } else if (pctDiff < -0.25) {
          suggestedBudget = Math.ceil(avgActual * 1.15);
          reason = `Spending is ${Math.round(Math.abs(pctDiff) * 100)}% under budget. Budget can be reduced to free funds elsewhere.`;
        } else {
          reason = 'Budget is well-aligned with actual spending. No change recommended.';
        }

        return {
          category: c.category,
          currentBudget: c.budgetAmount,
          suggestedBudget,
          reason,
        };
      })
      .filter((s) => s.currentBudget !== s.suggestedBudget || !categoryFilter);

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute budget adjustments' });
  }
});

export default router;
