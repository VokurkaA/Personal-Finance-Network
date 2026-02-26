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

function dateStr(monthsAgo: number, day: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log('🌱 Clearing existing data…');
  await run('MATCH (n) DETACH DELETE n');

  // ── User ─────────────────────────────────────────────────────────────────
  console.log('👤 Creating user…');
  await run(`CREATE (:User {
    id: 'user-001', name: 'Jan Zadrobilek', email: 'jan@example.com',
    createdAt: '2022-01-01', currency: 'CZK'
  })`);

  // ── Accounts ─────────────────────────────────────────────────────────────
  console.log('🏦 Creating accounts…');
  await run(`
    CREATE (a1:Account {id: 'acc-001', name: 'Běžný účet', type: 'checking',  balance: 87450,  bank: 'Komerční banka', createdAt: '2022-01-15'})
    CREATE (a2:Account {id: 'acc-002', name: 'Spořicí účet', type: 'savings', balance: 245000, bank: 'Komerční banka', createdAt: '2022-01-15'})
    CREATE (a3:Account {id: 'acc-003', name: 'Investice',   type: 'investment', balance: 130000, bank: 'Revolut',         createdAt: '2023-03-01'})
    WITH a1, a2, a3
    MATCH (u:User {id: 'user-001'})
    CREATE (u)-[:HAS {primaryAccount: true}]->(a1)
    CREATE (u)-[:HAS {primaryAccount: false}]->(a2)
    CREATE (u)-[:HAS {primaryAccount: false}]->(a3)
  `);

  // ── Cards ─────────────────────────────────────────────────────────────────
  console.log('💳 Creating cards…');
  await run(`
    MATCH (a1:Account {id: 'acc-001'}), (a3:Account {id: 'acc-003'})
    MATCH (u:User {id: 'user-001'})
    CREATE (c1:Card {id: 'card-001', name: 'KB Visa Debit', type: 'debit',  lastDigits: '4821', linkedAccount: 'acc-001'})
    CREATE (c2:Card {id: 'card-002', name: 'Revolut Credit', type: 'credit', lastDigits: '9034', limit: 80000, linkedAccount: 'acc-003'})
    CREATE (u)-[:OWNS]->(c1)
    CREATE (u)-[:OWNS]->(c2)
    CREATE (a1)-[:LINKED_TO]->(c1)
    CREATE (a3)-[:LINKED_TO]->(c2)
  `);

  // ── Categories ───────────────────────────────────────────────────────────
  console.log('🏷️  Creating categories…');
  await run(`
    MATCH (u:User {id: 'user-001'})
    CREATE (food:Category     {id: 'cat-food',      name: 'Jídlo',        type: 'expense', color: '#F97316', budget: 12000})
    CREATE (gro:Category      {id: 'cat-gro',       name: 'Potraviny',    type: 'expense', color: '#FB923C', budget: 7000})
    CREATE (rest:Category     {id: 'cat-rest',      name: 'Restaurace',   type: 'expense', color: '#FBBF24', budget: 5000})
    CREATE (trans:Category    {id: 'cat-trans',     name: 'Doprava',      type: 'expense', color: '#3B82F6', budget: 4000})
    CREATE (fuel:Category     {id: 'cat-fuel',      name: 'Pohonné hmoty',type: 'expense', color: '#60A5FA', budget: 2500})
    CREATE (pub:Category      {id: 'cat-pub',       name: 'MHD',          type: 'expense', color: '#93C5FD', budget: 1500})
    CREATE (house:Category    {id: 'cat-house',     name: 'Bydlení',      type: 'expense', color: '#8B5CF6', budget: 18000})
    CREATE (rent:Category     {id: 'cat-rent',      name: 'Nájem',        type: 'expense', color: '#A78BFA', budget: 14000})
    CREATE (util:Category     {id: 'cat-util',      name: 'Energie / Služby', type: 'expense', color: '#C4B5FD', budget: 4000})
    CREATE (ent:Category      {id: 'cat-ent',       name: 'Zábava',       type: 'expense', color: '#EC4899', budget: 6000})
    CREATE (stream:Category   {id: 'cat-stream',    name: 'Streaming',    type: 'expense', color: '#F472B6', budget: 1000})
    CREATE (health:Category   {id: 'cat-health',    name: 'Zdraví',       type: 'expense', color: '#10B981', budget: 3000})
    CREATE (salary:Category   {id: 'cat-salary',    name: 'Plat',         type: 'income',  color: '#22C55E'})
    CREATE (freelance:Category{id: 'cat-freelance', name: 'Freelance',    type: 'income',  color: '#84CC16'})
    CREATE (invest:Category   {id: 'cat-invest',    name: 'Investice',    type: 'expense', color: '#6366F1', budget: 10000})

    CREATE (food)-[:PARENT_OF]->(gro)
    CREATE (food)-[:PARENT_OF]->(rest)
    CREATE (trans)-[:PARENT_OF]->(fuel)
    CREATE (trans)-[:PARENT_OF]->(pub)
    CREATE (house)-[:PARENT_OF]->(rent)
    CREATE (house)-[:PARENT_OF]->(util)
    CREATE (ent)-[:PARENT_OF]->(stream)

    CREATE (u)-[:HAS]->(food)
    CREATE (u)-[:HAS]->(trans)
    CREATE (u)-[:HAS]->(house)
    CREATE (u)-[:HAS]->(ent)
    CREATE (u)-[:HAS]->(health)
    CREATE (u)-[:HAS]->(salary)
    CREATE (u)-[:HAS]->(freelance)
    CREATE (u)-[:HAS]->(invest)
  `);

  // ── Merchants ─────────────────────────────────────────────────────────────
  console.log('🏪 Creating merchants…');
  await run(`
    MATCH (gro:Category {id: 'cat-gro'}), (rest:Category {id: 'cat-rest'}),
          (stream:Category {id: 'cat-stream'}), (fuel:Category {id: 'cat-fuel'}),
          (health:Category {id: 'cat-health'})
    CREATE (m1:Merchant {id: 'mer-001', name: 'Albert',     category: '5411', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 650})
    CREATE (m2:Merchant {id: 'mer-002', name: 'Billa',      category: '5411', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 480})
    CREATE (m3:Merchant {id: 'mer-003', name: 'Pizza Roma', category: '5812', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 420})
    CREATE (m4:Merchant {id: 'mer-004', name: 'Starbucks',  category: '5812', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 145})
    CREATE (m5:Merchant {id: 'mer-005', name: 'Netflix',    category: '7841', locationCity: 'Amsterdam', locationCountry: 'NL', avgTransactionSize: 259})
    CREATE (m6:Merchant {id: 'mer-006', name: 'Shell',      category: '5541', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 1200})
    CREATE (m7:Merchant {id: 'mer-007', name: 'Spotify',    category: '7929', locationCity: 'Stockholm', locationCountry: 'SE', avgTransactionSize: 159})
    CREATE (m8:Merchant {id: 'mer-008', name: 'Dr. Novák',  category: '8099', locationCity: 'Praha',     locationCountry: 'CZ', avgTransactionSize: 800})

    CREATE (m1)-[:IN_CATEGORY]->(gro)
    CREATE (m2)-[:IN_CATEGORY]->(gro)
    CREATE (m3)-[:IN_CATEGORY]->(rest)
    CREATE (m4)-[:IN_CATEGORY]->(rest)
    CREATE (m5)-[:IN_CATEGORY]->(stream)
    CREATE (m6)-[:IN_CATEGORY]->(fuel)
    CREATE (m7)-[:IN_CATEGORY]->(stream)
    CREATE (m8)-[:IN_CATEGORY]->(health)
  `);

  // ── Goals ─────────────────────────────────────────────────────────────────
  console.log('🎯 Creating goals…');
  await run(`
    MATCH (u:User {id: 'user-001'})
    CREATE (g1:Goal {id: 'goal-001', name: 'Dovolená – Japonsko', type: 'savings',     targetAmount: 120000, currentAmount: 42000, deadline: '2026-09-01', riskProfile: 'low'})
    CREATE (g2:Goal {id: 'goal-002', name: 'Nové auto',           type: 'savings',     targetAmount: 400000, currentAmount: 95000, deadline: '2027-06-01', riskProfile: 'medium'})
    CREATE (g3:Goal {id: 'goal-003', name: 'Penzijní fond',       type: 'investment',  targetAmount: 2000000, currentAmount: 130000, deadline: '2050-01-01', riskProfile: 'high'})
    CREATE (u)-[:CONTRIBUTES_TO {transactionHistory: []}]->(g1)
    CREATE (u)-[:CONTRIBUTES_TO {transactionHistory: []}]->(g2)
    CREATE (u)-[:CONTRIBUTES_TO {transactionHistory: []}]->(g3)
  `);

  // ── Budget Plans ──────────────────────────────────────────────────────────
  console.log('📊 Creating budget plans…');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const budgetCategories = JSON.stringify([
    { category: 'Jídlo', budgetAmount: 12000 },
    { category: 'Doprava', budgetAmount: 4000 },
    { category: 'Bydlení', budgetAmount: 18000 },
    { category: 'Zábava', budgetAmount: 6000 },
    { category: 'Zdraví', budgetAmount: 3000 },
    { category: 'Investice', budgetAmount: 10000 },
  ]);

  await run(
    `MATCH (u:User {id: 'user-001'})
     CREATE (b1:BudgetPlan {id: 'budget-001', month: $currentMonth, categories: $cats, notes: 'Aktuální měsíc'})
     CREATE (b2:BudgetPlan {id: 'budget-002', month: $lastMonth,    categories: $cats, notes: 'Minulý měsíc'})
     CREATE (u)-[:FOLLOWS_BUDGET {month: $currentMonth, adherence: 0.82}]->(b1)
     CREATE (u)-[:FOLLOWS_BUDGET {month: $lastMonth,    adherence: 0.91}]->(b2)`,
    { currentMonth, lastMonth, cats: budgetCategories }
  );

  // ── Transactions ─────────────────────────────────────────────────────────
  console.log('💸 Creating transactions (6 months of history)…');

  type TxDef = {
    id: string; date: string; amount: number; description: string;
    type: 'income' | 'expense' | 'transfer'; status: 'completed' | 'pending';
    fromAcct?: string; toAcct?: string; merchant?: string; category?: string; confidence?: number;
    goalId?: string;
  };

  const txs: TxDef[] = [];
  let txIdx = 0;
  const mkId = () => `tx-${String(++txIdx).padStart(5, '0')}`;

  // Recurring income – 6 months
  for (let m = 0; m < 6; m++) {
    txs.push({
      id: mkId(), date: dateStr(m, 1), amount: 65000,
      description: 'Plat – Firma s.r.o.', type: 'income', status: 'completed',
      fromAcct: 'acc-001', category: 'Plat', confidence: 1.0,
    });
    if (m % 2 === 0) {
      txs.push({
        id: mkId(), date: dateStr(m, 15), amount: 12000,
        description: 'Freelance projekt', type: 'income', status: 'completed',
        fromAcct: 'acc-001', category: 'Freelance', confidence: 1.0,
      });
    }
  }

  // Rent – monthly
  for (let m = 0; m < 6; m++) {
    txs.push({
      id: mkId(), date: dateStr(m, 5), amount: 14500,
      description: 'Nájem – byt Praha 3', type: 'expense', status: 'completed',
      fromAcct: 'acc-001', category: 'Nájem', confidence: 0.99,
    });
    txs.push({
      id: mkId(), date: dateStr(m, 7), amount: 2400,
      description: 'Elektřina + plyn', type: 'expense', status: 'completed',
      fromAcct: 'acc-001', category: 'Energie / Služby', confidence: 0.97,
    });
  }

  // Streaming subscriptions
  for (let m = 0; m < 6; m++) {
    txs.push({ id: mkId(), date: dateStr(m, 3), amount: 259, description: 'Netflix', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant: 'mer-005', category: 'Streaming', confidence: 0.99 });
    txs.push({ id: mkId(), date: dateStr(m, 3), amount: 159, description: 'Spotify', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant: 'mer-007', category: 'Streaming', confidence: 0.99 });
  }

  // Groceries – ~4x per month
  const groceryAmounts = [620, 450, 780, 390, 510, 680, 440, 720, 560, 480, 640, 520, 590, 710, 470, 610, 530, 690, 420, 750, 580, 460, 630, 500];
  groceryAmounts.forEach((amount, i) => {
    const month = Math.floor(i / 4);
    const day = 5 + (i % 4) * 6;
    const merchant = i % 2 === 0 ? 'mer-001' : 'mer-002';
    txs.push({ id: mkId(), date: dateStr(month, day), amount, description: merchant === 'mer-001' ? 'Albert' : 'Billa', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant, category: 'Potraviny', confidence: 0.95 });
  });

  // Restaurants / café – ~6x per month
  for (let m = 0; m < 6; m++) {
    for (let w = 0; w < 6; w++) {
      const amount = w === 0 ? 385 + m * 10 : 130 + Math.floor(Math.random() * 80);
      const merchant = w === 0 ? 'mer-003' : 'mer-004';
      txs.push({ id: mkId(), date: dateStr(m, 3 + w * 4), amount, description: merchant === 'mer-003' ? 'Pizza Roma' : 'Starbucks', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant, category: 'Restaurace', confidence: 0.92 });
    }
  }

  // Fuel – twice a month
  for (let m = 0; m < 6; m++) {
    txs.push({ id: mkId(), date: dateStr(m, 8), amount: 1150, description: 'Shell – benzín', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant: 'mer-006', category: 'Pohonné hmoty', confidence: 0.99 });
    txs.push({ id: mkId(), date: dateStr(m, 22), amount: 1320, description: 'Shell – benzín', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant: 'mer-006', category: 'Pohonné hmoty', confidence: 0.99 });
  }

  // Health – twice
  txs.push({ id: mkId(), date: dateStr(1, 14), amount: 800, description: 'Dr. Novák – konzultace', type: 'expense', status: 'completed', fromAcct: 'acc-001', merchant: 'mer-008', category: 'Zdraví', confidence: 0.9 });
  txs.push({ id: mkId(), date: dateStr(3, 22), amount: 1200, description: 'Zubař', type: 'expense', status: 'completed', fromAcct: 'acc-001', category: 'Zdraví', confidence: 0.85 });

  // Savings transfers to goal – monthly
  for (let m = 0; m < 6; m++) {
    txs.push({ id: mkId(), date: dateStr(m, 2), amount: 7000, description: 'Spoření – Japonsko', type: 'transfer', status: 'completed', fromAcct: 'acc-001', toAcct: 'acc-002', category: 'Investice', confidence: 1.0, goalId: 'goal-001' });
    txs.push({ id: mkId(), date: dateStr(m, 2), amount: 15000, description: 'Spoření – Auto', type: 'transfer', status: 'completed', fromAcct: 'acc-001', toAcct: 'acc-002', category: 'Investice', confidence: 1.0, goalId: 'goal-002' });
  }

  // ── ANOMALY: one suspiciously large transaction ───────────────────────────
  txs.push({
    id: 'tx-anomaly-01', date: dateStr(0, 14), amount: 45000,
    description: 'Online nákup – Neznámý obchodník', type: 'expense', status: 'completed',
    fromAcct: 'acc-001', category: 'Zábava', confidence: 0.3,
  });

  // ── Insert transactions in batches ────────────────────────────────────────
  const BATCH = 20;
  for (let i = 0; i < txs.length; i += BATCH) {
    const batch = txs.slice(i, i + BATCH);
    for (const tx of batch) {
      const params: Record<string, unknown> = {
        id: tx.id, date: tx.date, amount: tx.amount,
        description: tx.description, type: tx.type, status: tx.status,
        fromAcct: tx.fromAcct ?? null, toAcct: tx.toAcct ?? null,
        merchant: tx.merchant ?? null, category: tx.category ?? null,
        confidence: tx.confidence ?? 0.8, goalId: tx.goalId ?? null,
      };
      await run(
        `CREATE (t:Transaction {id: $id, date: $date, amount: $amount, description: $description, type: $type, status: $status})
         WITH t
         OPTIONAL MATCH (fa:Account {id: $fromAcct})
         FOREACH (_ IN CASE WHEN fa IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:FROM {date: $date}]->(fa))
         WITH t
         OPTIONAL MATCH (ta:Account {id: $toAcct})
         FOREACH (_ IN CASE WHEN ta IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:TO]->(ta))
         WITH t
         OPTIONAL MATCH (m:Merchant {id: $merchant})
         FOREACH (_ IN CASE WHEN m IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:SPENT_AT {mcc: m.category, timestamp: $date}]->(m))
         WITH t
         OPTIONAL MATCH (c:Category {name: $category})
         FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:CATEGORIZED_AS {confidence: $confidence}]->(c))
         WITH t
         OPTIONAL MATCH (g:Goal {id: $goalId})
         FOREACH (_ IN CASE WHEN g IS NOT NULL THEN [1] ELSE [] END | CREATE (t)-[:CONTRIBUTES_TO {contributedAt: $date}]->(g))`,
        params
      );
    }
    console.log(`  ${Math.min(i + BATCH, txs.length)}/${txs.length} transactions…`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`   Transactions created: ${txs.length}`);
}

seed()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => driver.close());
