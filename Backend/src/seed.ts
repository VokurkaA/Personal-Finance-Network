import 'dotenv/config';
import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
const user = process.env.NEO4J_USER ?? 'neo4j';
const password = process.env.NEO4J_PASSWORD ?? 'password';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function run(cypher: string, params: Record<string, unknown> = {}) {
  const session = driver.session();
  try {
    await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

function getSpecificDate(monthsAgo: number, day: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDayOfMonth));
  return d.toISOString().slice(0, 10);
}

type TxDef = {
  id: string; date: string; amount: number; description: string;
  type: 'income' | 'expense' | 'transfer'; status: 'completed' | 'pending';
  fromAcct?: string; toAcct?: string; merchant?: string; category?: string; confidence?: number;
  goalId?: string;
};

async function seed() {
  console.log('🌱 Starting 10-Year Full History Simulation (Martin, 33)…');
  await run('MATCH (n) DETACH DELETE n');

  // ── User ─────────────────────────────────────────────────────────────────
  await run(`CREATE (:User {
    id: 'user-001', name: 'Martin Procházka', email: 'martin.p@example.cz',
    createdAt: '${getSpecificDate(120, 1)}', currency: 'CZK'
  })`);

  // ── Accounts ─────────────────────────────────────────────────────────────
  await run(`
    CREATE (a1:Account {id: 'acc-001', name: 'Hlavní účet (KB)', type: 'checking', balance: 0, bank: 'Komerční banka', createdAt: '${getSpecificDate(120, 1)}'})
    CREATE (a2:Account {id: 'acc-002', name: 'Spoření (AirBank)', type: 'savings', balance: 0, bank: 'AirBank', createdAt: '${getSpecificDate(120, 1)}'})
    CREATE (a3:Account {id: 'acc-003', name: 'Investice (Revolut)', type: 'investment', balance: 0, bank: 'Revolut', createdAt: '${getSpecificDate(72, 1)}'})
    WITH a1, a2, a3
    MATCH (u:User {id: 'user-001'})
    CREATE (u)-[:HAS {primaryAccount: true}]->(a1)
    CREATE (u)-[:HAS {primaryAccount: false}]->(a2)
    CREATE (u)-[:HAS {primaryAccount: false}]->(a3)
  `);

  // ── Categories ───────────────────────────────────────────────────────────
  await run(`
    MATCH (u:User {id: 'user-001'})
    CREATE (food:Category     {id: 'cat-food',      name: 'Jídlo',        type: 'expense', color: '#F97316'})
    CREATE (gro:Category      {id: 'cat-gro',       name: 'Potraviny',    type: 'expense', color: '#FB923C'})
    CREATE (rest:Category     {id: 'cat-rest',      name: 'Restaurace',   type: 'expense', color: '#FBBF24'})
    CREATE (trans:Category    {id: 'cat-trans',     name: 'Doprava',      type: 'expense', color: '#3B82F6'})
    CREATE (fuel:Category     {id: 'cat-fuel',      name: 'Pohonné hmoty',type: 'expense', color: '#60A5FA'})
    CREATE (pub:Category      {id: 'cat-pub',       name: 'MHD',          type: 'expense', color: '#93C5FD'})
    CREATE (house:Category    {id: 'cat-house',     name: 'Bydlení',      type: 'expense', color: '#8B5CF6'})
    CREATE (rent:Category     {id: 'cat-rent',      name: 'Nájem',        type: 'expense', color: '#A78BFA'})
    CREATE (util:Category     {id: 'cat-util',      name: 'Energie / Služby', type: 'expense', color: '#C4B5FD'})
    CREATE (ent:Category      {id: 'cat-ent',       name: 'Zábava',       type: 'expense', color: '#EC4899'})
    CREATE (stream:Category   {id: 'cat-stream',    name: 'Streaming',    type: 'expense', color: '#F472B6'})
    CREATE (shop:Category     {id: 'cat-shop',      name: 'Nákupy',       type: 'expense', color: '#6366F1'})
    CREATE (elec:Category     {id: 'cat-elec',      name: 'Elektronika',  type: 'expense', color: '#818CF8'})
    CREATE (clothes:Category  {id: 'cat-clothes',   name: 'Oblečení',     type: 'expense', color: '#A5B4FC'})
    CREATE (health:Category   {id: 'cat-health',    name: 'Zdraví',       type: 'expense', color: '#10B981'})
    CREATE (insur:Category    {id: 'cat-insur',     name: 'Pojištění',    type: 'expense', color: '#06B6D4'})
    CREATE (salary:Category   {id: 'cat-salary',    name: 'Plat',         type: 'income',  color: '#22C55E'})
    CREATE (freelance:Category{id: 'cat-freelance', name: 'Freelance',    type: 'income',  color: '#84CC16'})
    CREATE (invest:Category   {id: 'cat-invest',    name: 'Investice',    type: 'expense', color: '#F59E0B'})
    WITH food, gro, rest, trans, fuel, pub, house, rent, util, ent, stream, shop, elec, clothes, health, insur, salary, freelance, invest
    CREATE (food)-[:PARENT_OF]->(gro), (food)-[:PARENT_OF]->(rest), (trans)-[:PARENT_OF]->(fuel), (trans)-[:PARENT_OF]->(pub), (house)-[:PARENT_OF]->(rent), (house)-[:PARENT_OF]->(util), (ent)-[:PARENT_OF]->(stream), (shop)-[:PARENT_OF]->(elec), (shop)-[:PARENT_OF]->(clothes)
  `);

  // ── Goals ─────────────────────────────────────────────────────────────────
  console.log('🎯 Defining Goal Lifecycle…');
  await run(`
    MATCH (u:User {id: 'user-001'})
    // Current Goals
    CREATE (g1:Goal {id: 'goal-house', name: 'Vlastní dům', type: 'savings', targetAmount: 4000000, currentAmount: 0, deadline: '${getSpecificDate(-36, 1)}', riskProfile: 'medium'})
    CREATE (g2:Goal {id: 'goal-sp500', name: 'S&P 500 Portfolio', type: 'investment', targetAmount: 10000000, currentAmount: 0, deadline: '${getSpecificDate(-360, 1)}', riskProfile: 'high'})
    // Past (Achieved) Goals
    CREATE (g3:Goal {id: 'goal-emergency', name: 'Rezerva (6 měsíců)', type: 'savings', targetAmount: 150000, currentAmount: 150000, deadline: '${getSpecificDate(96, 1)}', riskProfile: 'low'})
    CREATE (g4:Goal {id: 'goal-car-old', name: 'První auto', type: 'savings', targetAmount: 250000, currentAmount: 250000, deadline: '${getSpecificDate(60, 1)}', riskProfile: 'low'})
    CREATE (g5:Goal {id: 'goal-wedding', name: 'Svatba', type: 'savings', targetAmount: 200000, currentAmount: 200000, deadline: '${getSpecificDate(24, 1)}', riskProfile: 'low'})

    CREATE (u)-[:CONTRIBUTES_TO]->(g1), (u)-[:CONTRIBUTES_TO]->(g2), (u)-[:CONTRIBUTES_TO]->(g3), (u)-[:CONTRIBUTES_TO]->(g4), (u)-[:CONTRIBUTES_TO]->(g5)
  `);

  // ── Simulation Logic ─────────────────────────────────────────────────────
  const txs: TxDef[] = [];
  let txIdx = 0;
  const mkId = () => `tx-${String(++txIdx).padStart(7, '0')}`;

  let salary = 32000;
  let rent = 9500;
  let utilities = 1800;
  let checkingBalance = 25000;
  let savingsBalance = 40000;
  let investmentBalance = 0;

  const HISTORY_MONTHS = 120;
  const INFLATION_ANNUAL = 0.035;

  for (let m = HISTORY_MONTHS; m >= 0; m--) {
    const yearOfSim = Math.floor((HISTORY_MONTHS - m) / 12);
    const monthOfSim = (HISTORY_MONTHS - m) % 12;
    const currentYear = new Date().getFullYear() - 10 + yearOfSim;
    const currentMonthLabel = `${currentYear}-${String(monthOfSim + 1).padStart(2, '0')}`;

    const hasCar = yearOfSim >= 5;
    const isEstablished = yearOfSim >= 7;
    const isHomeowner = yearOfSim >= 9;

    // Annual Updates
    if (monthOfSim === 0 && yearOfSim > 0) {
      if (!isHomeowner) rent *= (1 + INFLATION_ANNUAL);
      utilities *= (1 + INFLATION_ANNUAL);
      if (yearOfSim % 2 === 0) salary *= 1.18; else salary *= 1.05;
    }

    // Career Progression Jumps
    if (yearOfSim === 5 && monthOfSim === 0) salary = 85000; // Senior promotion
    if (yearOfSim === 8 && monthOfSim === 0) salary = 125000; // Manager promotion

    // ── Monthly Budget Plan ──
    const budgetCats = [
      { category: 'Potraviny', budgetAmount: Math.round((isEstablished ? 12000 : 6000) * (1 + (yearOfSim * 0.05))) },
      { category: 'Restaurace', budgetAmount: Math.round((isEstablished ? 10000 : 4000) * (1 + (yearOfSim * 0.08))) },
      { category: 'Doprava', budgetAmount: Math.round(hasCar ? 6000 : 1500) },
      { category: 'Bydlení', budgetAmount: Math.round(isHomeowner ? 40000 : rent + utilities) },
      { category: 'Zábava', budgetAmount: Math.round((isEstablished ? 15000 : 5000) * (1 + (yearOfSim * 0.1))) },
      { category: 'Investice', budgetAmount: Math.round(salary * 0.25) }
    ];

    await run(`
      MATCH (u:User {id: 'user-001'})
      CREATE (b:BudgetPlan {id: 'budget-${currentMonthLabel}', month: '${currentMonthLabel}', categories: $cats, notes: 'Plán pro ${currentMonthLabel}'})
      CREATE (u)-[:FOLLOWS_BUDGET {month: '${currentMonthLabel}', adherence: $adherence}]->(b)
    `, { cats: JSON.stringify(budgetCats), adherence: 0.85 + Math.random() * 0.15 });

    // ── Income ──
    const actualSalary = Math.round(salary * (0.99 + Math.random() * 0.02));
    txs.push({ id: mkId(), date: getSpecificDate(m, 1), amount: actualSalary, description: 'Výplata', type: 'income', status: 'completed', fromAcct: 'acc-001', category: 'Plat' });
    checkingBalance += actualSalary;

    // ── Fixed Expenses ──
    let currentHousing = isHomeowner ? 35000 : rent;
    txs.push({ id: mkId(), date: getSpecificDate(m, 5), amount: Math.round(currentHousing), description: isHomeowner ? 'Hypotéka' : 'Nájem', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Nájem' });
    checkingBalance -= currentHousing;

    txs.push({ id: mkId(), date: getSpecificDate(m, 7), amount: Math.round(utilities), description: 'Služby a energie', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Energie / Služby' });
    checkingBalance -= utilities;

    // ── Daily Pulse ──
    for (let day = 1; day <= 30; day++) {
      // Food
      const foodSpend = (isEstablished ? 300 : 150) + Math.random() * 200;
      txs.push({ id: mkId(), date: getSpecificDate(m, day), amount: Math.round(foodSpend), description: 'Oběd / Káva', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Restaurace' });
      checkingBalance -= foodSpend;

      // Grocery
      if (day % 3 === 0) {
        const grocAmt = (isEstablished ? 800 : 400) * (0.6 + Math.random() * 1.2);
        txs.push({ id: mkId(), date: getSpecificDate(m, day), amount: Math.round(grocAmt), description: 'Potraviny', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Potraviny' });
        checkingBalance -= grocAmt;
      }

      // Leisure
      if (day % 7 === 6 || day % 7 === 0) {
        const funAmt = (isEstablished ? 2000 : 800) * (0.5 + Math.random() * 1.5);
        txs.push({ id: mkId(), date: getSpecificDate(m, day), amount: Math.round(funAmt), description: 'Zábava / Pub', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Zábava' });
        checkingBalance -= funAmt;
      }
    }

    // ── Savings & Goal Allocation Logic ──
    if (checkingBalance > salary * 0.3) {
      const surplus = Math.floor((checkingBalance - salary * 0.2) * 0.85);
      if (surplus > 3000) {
        let activeGoalId = 'goal-emergency';
        if (yearOfSim >= 1 && yearOfSim < 3) activeGoalId = 'goal-emergency';
        else if (yearOfSim >= 3 && yearOfSim < 5) activeGoalId = 'goal-car-old';
        else if (yearOfSim >= 5 && yearOfSim < 7) activeGoalId = 'goal-wedding';
        else if (yearOfSim >= 7 && yearOfSim < 10) activeGoalId = 'goal-house';
        
        // Investment account opens in year 6
        if (yearOfSim >= 6 && Math.random() > 0.4) {
           txs.push({ id: mkId(), date: getSpecificDate(m, 28), amount: surplus, description: 'S&P 500 nákup', type: 'transfer', status: 'completed', fromAcct: 'acc-001', toAcct: 'acc-003', goalId: 'goal-sp500' });
           investmentBalance += surplus;
        } else {
           txs.push({ id: mkId(), date: getSpecificDate(m, 28), amount: surplus, description: 'Převod na spoření', type: 'transfer', status: 'completed', fromAcct: 'acc-001', toAcct: 'acc-002', goalId: activeGoalId });
           savingsBalance += surplus;
        }
        checkingBalance -= surplus;
      }
    }
  }

  // Final Insertion
  console.log(`🚀 Inserting ${txs.length} transactions and budget history...`);
  const BATCH = 300;
  for (let i = 0; i < txs.length; i += BATCH) {
    const batch = txs.slice(i, i + BATCH);
    for (const tx of batch) {
      const params: Record<string, unknown> = {
        id: tx.id, date: tx.date, amount: tx.amount, description: tx.description, type: tx.type, status: tx.status,
        fromAcct: tx.fromAcct ?? null, toAcct: tx.toAcct ?? null, category: tx.category ?? null, goalId: tx.goalId ?? null,
      };
      await run(`
        CREATE (t:Transaction {id: $id, date: $date, amount: $amount, description: $description, type: $type, status: $status})
        WITH t
        OPTIONAL MATCH (fa:Account {id: $fromAcct})
        FOREACH (_ IN CASE WHEN fa IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:FROM {date: $date}]->(fa))
        WITH t
        OPTIONAL MATCH (ta:Account {id: $toAcct})
        FOREACH (_ IN CASE WHEN ta IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:TO]->(ta))
        WITH t
        OPTIONAL MATCH (c:Category {name: $category})
        FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:CATEGORIZED_AS {confidence: 1.0}]->(c))
        WITH t
        OPTIONAL MATCH (g:Goal {id: $goalId})
        FOREACH (_ IN CASE WHEN g IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:CONTRIBUTES_TO {contributedAt: $date}]->(g))
      `, params);
    }
  }

  await run(`MATCH (a:Account {id: 'acc-001'}) SET a.balance = $b1`, { b1: Math.round(checkingBalance) });
  await run(`MATCH (a:Account {id: 'acc-002'}) SET a.balance = $b2`, { b2: Math.round(savingsBalance) });
  await run(`MATCH (a:Account {id: 'acc-003'}) SET a.balance = $b3`, { b3: Math.round(investmentBalance) });
  await run(`MATCH (g:Goal) OPTIONAL MATCH (t:Transaction)-[:CONTRIBUTES_TO]->(g) WITH g, sum(t.amount) as total SET g.currentAmount = total`);

  console.log(`✅ 10-Year Full Life Simulation Complete!`);
  console.log(`Transactions: ${txs.length}, Budget Plans: 121`);
  console.log(`Final Balances: Checking: ${Math.round(checkingBalance)}, Savings: ${Math.round(savingsBalance)}, Invest: ${Math.round(investmentBalance)}`);
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); }).finally(() => driver.close());
