import { Router, Request, Response } from 'express';
import { runQuery } from '../db';

const router = Router();

// ── Helpers ─────────────────────────────────────────────────────────────────

function monthRange(month: string): { startDate: string; endDate: string } {
  const [year, mon] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const nextY = mon === 12 ? year + 1 : year;
  const nextM = mon === 12 ? 1 : mon + 1;
  const endDate = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
  return { startDate, endDate };
}

function zScore(values: number[]): number[] {
  if (values.length < 2) return values.map(() => 0);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std === 0) return values.map(() => 0);
  return values.map((v) => Math.abs((v - mean) / std));
}

// ── GET /api/analytics/cashflow?month=YYYY-MM ────────────────────────────────
router.get('/cashflow', async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    const { startDate, endDate } = monthRange(month);

    const [incomeRows, expenseRows, balanceRows] = await Promise.all([
      runQuery<{ source: string; amount: number; account: string }>(
        `MATCH (t:Transaction)-[:FROM]->(a:Account)
         WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'income'
         RETURN t.description AS source, sum(t.amount) AS amount, a.id AS account`,
        { startDate, endDate }
      ),
      runQuery<{ category: string; amount: number; percentage: number }>(
        `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
         WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
         RETURN c.name AS category, sum(t.amount) AS amount, 0.0 AS percentage`,
        { startDate, endDate }
      ),
      runQuery<{ fromBalance: number; toBalance: number }>(
        `MATCH (a:Account)
         RETURN sum(a.balance) AS toBalance, sum(a.balance) AS fromBalance`,
        {}
      ),
    ]);

    const totalIncome = incomeRows.reduce((s, r) => s + Number(r.amount), 0);
    const totalExpenses = expenseRows.reduce((s, r) => s + Number(r.amount), 0);
    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? netCashflow / totalIncome : 0;
    const toBalance = Number(balanceRows[0]?.toBalance ?? 0);

    // Fix percentages
    const expenses = expenseRows.map((e) => ({
      ...e,
      amount: Number(e.amount),
      percentage: totalExpenses > 0 ? Math.round((Number(e.amount) / totalExpenses) * 1000) / 10 : 0,
    }));

    res.json({
      month,
      income: incomeRows.map((i) => ({ ...i, amount: Number(i.amount) })),
      totalIncome,
      expenses,
      totalExpenses,
      netCashflow,
      savingsRate: Math.round(savingsRate * 1000) / 1000,
      accountBalanceChange: { from: toBalance - netCashflow, to: toBalance },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute cashflow' });
  }
});

// ── GET /api/analytics/cashflow-breakdown?month=YYYY-MM ─────────────────────
router.get('/cashflow-breakdown', async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    const { startDate, endDate } = monthRange(month);

    // Parent categories
    const parentRows = await runQuery<{ id: string; name: string; amount: number }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
         AND NOT ((:Category)-[:PARENT_OF]->(c))
       RETURN c.id AS id, c.name AS name, sum(t.amount) AS amount`,
      { startDate, endDate }
    );

    // Child categories (one level)
    const childRows = await runQuery<{ parentName: string; name: string; amount: number }>(
      `MATCH (parent:Category)-[:PARENT_OF]->(c:Category)<-[:CATEGORIZED_AS]-(t:Transaction)
       WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
       RETURN parent.name AS parentName, c.name AS name, sum(t.amount) AS amount`,
      { startDate, endDate }
    );

    const total = parentRows.reduce((s, r) => s + Number(r.amount), 0) +
                  childRows.reduce((s, r) => s + Number(r.amount), 0);

    const childMap = new Map<string, Array<{ category: string; amount: number; percentage: number; subcategories: [] }>>();
    for (const r of childRows) {
      if (!childMap.has(r.parentName)) childMap.set(r.parentName, []);
      childMap.get(r.parentName)!.push({
        category: r.name,
        amount: Number(r.amount),
        percentage: total > 0 ? Math.round((Number(r.amount) / total) * 1000) / 10 : 0,
        subcategories: [],
      });
    }

    const result = parentRows.map((r) => ({
      category: r.name,
      amount: Number(r.amount),
      percentage: total > 0 ? Math.round((Number(r.amount) / total) * 1000) / 10 : 0,
      subcategories: childMap.get(r.name) ?? [],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute cashflow breakdown' });
  }
});

// ── GET /api/analytics/spending-by-category?months=N ────────────────────────
router.get('/spending-by-category', async (req: Request, res: Response) => {
  try {
    const months = parseInt((req.query.months as string) ?? '3', 10);
    const now = new Date();

    const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
    const rangeStart = new Date(now);
    rangeStart.setMonth(rangeStart.getMonth() - months);
    const rangeStartStr = rangeStart.toISOString().slice(0, 10);

    const [thisRows, lastRows] = await Promise.all([
      runQuery<{ category: string; amount: number }>(
        `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
         WHERE t.date >= $start AND t.type = 'expense'
         RETURN c.name AS category, sum(t.amount) AS amount`,
        { start: thisMonthStart }
      ),
      runQuery<{ category: string; amount: number }>(
        `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
         WHERE t.date >= $start AND t.date < $end AND t.type = 'expense'
         RETURN c.name AS category, sum(t.amount) AS amount`,
        { start: lastMonthStart, end: thisMonthStart }
      ),
    ]);

    const thisMap = new Map(thisRows.map((r) => [r.category, Number(r.amount)]));
    const lastMap = new Map(lastRows.map((r) => [r.category, Number(r.amount)]));
    const allCats = new Set([...thisMap.keys(), ...lastMap.keys()]);

    // Also filter: only categories with activity in the requested range
    const activeRows = await runQuery<{ category: string }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $start AND t.type = 'expense'
       RETURN DISTINCT c.name AS category`,
      { start: rangeStartStr }
    );
    const activeCats = new Set(activeRows.map((r) => r.category));

    const result = [...allCats]
      .filter((c) => activeCats.has(c))
      .map((category) => {
        const thisMonth = thisMap.get(category) ?? 0;
        const lastMonth = lastMap.get(category) ?? 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (thisMonth > lastMonth * 1.05) trend = 'up';
        else if (thisMonth < lastMonth * 0.95) trend = 'down';
        return { category, thisMonth, lastMonth, trend };
      });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute spending by category' });
  }
});

// ── GET /api/analytics/anomalies?threshold=0.9 ───────────────────────────────
router.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const threshold = parseFloat((req.query.threshold as string) ?? '0.9');

    // Fetch all expense transactions with their category
    const rows = await runQuery<{
      id: string; date: string; amount: number; description: string;
      merchantName: string; category: string; city: string; country: string;
    }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.type = 'expense'
       OPTIONAL MATCH (t)-[:SPENT_AT]->(m:Merchant)
       RETURN t.id AS id, t.date AS date, t.amount AS amount, t.description AS description,
              coalesce(m.name, t.description) AS merchantName,
              c.name AS category,
              coalesce(m.locationCity, '') AS city,
              coalesce(m.locationCountry, '') AS country`
    );

    // Group by category and compute z-scores
    const byCat = new Map<string, typeof rows>();
    for (const r of rows) {
      if (!byCat.has(r.category)) byCat.set(r.category, []);
      byCat.get(r.category)!.push(r);
    }

    const anomalies: Array<{
      transactionId: string; date: string; amount: number; merchant: string;
      category: string; anomalyScore: number; reason: string; location?: string;
      timePattern?: string; recommendation?: string;
    }> = [];

    for (const [cat, txs] of byCat) {
      const amounts = txs.map((t) => Number(t.amount));
      const scores = zScore(amounts);
      const maxZ = Math.max(...scores);

      txs.forEach((tx, i) => {
        const normalizedScore = maxZ > 0 ? scores[i] / maxZ : 0;
        if (normalizedScore >= threshold) {
          const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
          const multiple = mean > 0 ? (Number(tx.amount) / mean).toFixed(1) : '∞';
          anomalies.push({
            transactionId: tx.id,
            date: tx.date,
            amount: Number(tx.amount),
            merchant: tx.merchantName,
            category: cat,
            anomalyScore: Math.round(normalizedScore * 100) / 100,
            reason: `Amount is ${multiple}x the category average (${Math.round(mean)})`,
            location: tx.city || tx.country ? `${tx.city} ${tx.country}`.trim() : undefined,
            recommendation: 'Verify this transaction with your bank',
          });
        }
      });
    }

    anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
    res.json({ anomalies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute anomalies' });
  }
});

// ── GET /api/analytics/spending-flow?month=YYYY-MM ───────────────────────────
router.get('/spending-flow', async (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    const { startDate, endDate } = monthRange(month);

    const [incomeRows, expenseRows] = await Promise.all([
      runQuery<{ source: string; accountId: string; accountLabel: string; amount: number }>(
        `MATCH (t:Transaction)-[:FROM]->(a:Account)
         WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'income'
         RETURN t.description AS source, a.id AS accountId, a.name AS accountLabel, sum(t.amount) AS amount`,
        { startDate, endDate }
      ),
      runQuery<{ accountId: string; accountLabel: string; category: string; amount: number }>(
        `MATCH (t:Transaction)-[:FROM]->(a:Account), (t)-[:CATEGORIZED_AS]->(c:Category)
         WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
         RETURN a.id AS accountId, a.name AS accountLabel, c.name AS category, sum(t.amount) AS amount`,
        { startDate, endDate }
      ),
    ]);

    const nodes: Array<{ id: string; type: string; label: string }> = [];
    const edges: Array<{ from: string; to: string; amount: number }> = [];
    const nodeSet = new Set<string>();

    const addNode = (id: string, type: string, label: string) => {
      if (!nodeSet.has(id)) {
        nodes.push({ id, type, label });
        nodeSet.add(id);
      }
    };

    for (const r of incomeRows) {
      const srcId = `income-${r.source.replace(/\s+/g, '-').toLowerCase()}`;
      addNode(srcId, 'income', r.source);
      addNode(r.accountId, 'account', r.accountLabel);
      edges.push({ from: srcId, to: r.accountId, amount: Number(r.amount) });
    }

    for (const r of expenseRows) {
      const catId = `cat-${r.category.replace(/\s+/g, '-').toLowerCase()}`;
      addNode(r.accountId, 'account', r.accountLabel);
      addNode(catId, 'category', r.category);
      edges.push({ from: r.accountId, to: catId, amount: Number(r.amount) });
    }

    res.json({ month, nodes, edges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute spending flow' });
  }
});

// ── GET /api/analytics/account-flow?account=<id> ────────────────────────────
router.get('/account-flow', async (req: Request, res: Response) => {
  try {
    const accountId = req.query.account as string;
    if (!accountId) return res.status(400).json({ error: 'account param required' });

    const rows = await runQuery<{ inflow: number; outflow: number }>(
      `MATCH (a:Account {id: $accountId})
       OPTIONAL MATCH (inTx:Transaction)-[:TO]->(a)
       OPTIONAL MATCH (outTx:Transaction)-[:FROM]->(a) WHERE outTx.type = 'expense' OR outTx.type = 'transfer'
       RETURN coalesce(sum(DISTINCT inTx.amount), 0) AS inflow,
              coalesce(sum(DISTINCT outTx.amount), 0) AS outflow`,
      { accountId }
    );

    const inflow = Number(rows[0]?.inflow ?? 0);
    const outflow = Number(rows[0]?.outflow ?? 0);
    res.json({ inflow, outflow, netFlow: inflow - outflow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute account flow' });
  }
});

// ── GET /api/analytics/year-in-review?year=YYYY ──────────────────────────────
router.get('/year-in-review', async (req: Request, res: Response) => {
  try {
    const year = parseInt((req.query.year as string) ?? String(new Date().getFullYear()), 10);
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;

    const [totalRows, topCatRows, monthRows] = await Promise.all([
      runQuery<{ totalIncome: number; totalExpenses: number }>(
        `MATCH (t:Transaction)
         WHERE t.date >= $startDate AND t.date < $endDate
         RETURN sum(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS totalIncome,
                sum(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS totalExpenses`,
        { startDate, endDate }
      ),
      runQuery<{ category: string; amount: number }>(
        `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
         WHERE t.date >= $startDate AND t.date < $endDate AND t.type = 'expense'
         RETURN c.name AS category, sum(t.amount) AS amount
         ORDER BY amount DESC LIMIT 5`,
        { startDate, endDate }
      ),
      runQuery<{ month: string; income: number; expenses: number }>(
        `MATCH (t:Transaction)
         WHERE t.date >= $startDate AND t.date < $endDate
         RETURN substring(t.date, 0, 7) AS month,
                sum(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS income,
                sum(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expenses
         ORDER BY month ASC`,
        { startDate, endDate }
      ),
    ]);

    const totalIncome = Number(totalRows[0]?.totalIncome ?? 0);
    const totalExpenses = Number(totalRows[0]?.totalExpenses ?? 0);

    res.json({
      year,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10 : 0,
      topCategories: topCatRows.map((r) => ({ category: r.category, amount: Number(r.amount) })),
      monthlyBreakdown: monthRows.map((r) => ({
        month: r.month,
        income: Number(r.income),
        expenses: Number(r.expenses),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute year in review' });
  }
});

// ── GET /api/analytics/spending-patterns?months=N ───────────────────────────
router.get('/spending-patterns', async (req: Request, res: Response) => {
  try {
    const months = parseInt((req.query.months as string) ?? '6', 10);
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const startDate = since.toISOString().slice(0, 10);

    const rows = await runQuery<{ month: string; category: string; amount: number }>(
      `MATCH (t:Transaction)-[:CATEGORIZED_AS]->(c:Category)
       WHERE t.date >= $startDate AND t.type = 'expense'
       RETURN substring(t.date, 0, 7) AS month, c.name AS category, sum(t.amount) AS amount
       ORDER BY month ASC`,
      { startDate }
    );

    // Group by category to identify patterns
    const catMap = new Map<string, Map<string, number>>();
    for (const r of rows) {
      if (!catMap.has(r.category)) catMap.set(r.category, new Map());
      catMap.get(r.category)!.set(r.month, Number(r.amount));
    }

    const patterns = [...catMap.entries()].map(([category, monthlyAmounts]) => {
      const entries = [...monthlyAmounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      const amounts = entries.map((e) => e[1]);
      const avg = amounts.reduce((s, v) => s + v, 0) / (amounts.length || 1);
      const isRecurring = amounts.length >= 2 && amounts.every((a) => a > 0);
      return {
        category,
        monthlyData: Object.fromEntries(entries),
        averageMonthly: Math.round(avg),
        isRecurring,
        months: amounts.length,
      };
    });

    res.json(patterns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute spending patterns' });
  }
});

export default router;
