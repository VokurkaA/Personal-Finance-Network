import { v4 as uuidv4 } from 'uuid';
import { int } from 'neo4j-driver';
import { runQuery, runQuerySingle } from '../db';
import type { Transaction } from '../types';

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

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  accountId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class TransactionService {
  static async getAll(filters: TransactionFilters): Promise<Transaction[]> {
    let conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.startDate) {
      conditions.push('t.date >= $startDate');
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      conditions.push('t.date <= $endDate');
      params.endDate = filters.endDate;
    }
    if (filters.search) {
      conditions.push('toLower(t.description) CONTAINS toLower($search)');
      params.search = filters.search;
    }

    let matchBase = '';
    
    if (filters.accountId) {
      matchBase = `
        MATCH (a:Account {id: $accountId})
        MATCH (t:Transaction)
        WHERE (t)-[:FROM]->(a) OR (t)-[:TO]->(a)
      `;
      params.accountId = filters.accountId;
    } else if (filters.category) {
      matchBase = `
        MATCH (cat:Category {name: $category})<-[r_cat:CATEGORIZED_AS]-(t:Transaction)
      `;
      params.category = filters.category;
    } else {
      matchBase = `MATCH (t:Transaction)`;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const limitClause = filters.limit ? `SKIP $offset LIMIT $limit` : '';
    params.limit = filters.limit ? int(filters.limit) : null;
    params.offset = filters.offset ? int(filters.offset) : int(0);

    const cypher = `
      ${matchBase}
      ${where}
      WITH t
      OPTIONAL MATCH (t)-[:FROM]->(fa:Account)
      OPTIONAL MATCH (t)-[:TO]->(ta:Account)
      OPTIONAL MATCH (t)-[:SPENT_AT]->(m:Merchant)
      OPTIONAL MATCH (t)-[r_cat:CATEGORIZED_AS]->(cat:Category)
      ${TX_RETURN}
      ${limitClause}
    `;

    const rows = await runQuery<{ tx: Transaction }>(cypher, params);
    return rows.map((r) => r.tx);
  }

  static async getById(id: string): Promise<Transaction | null> {
    const row = await runQuerySingle<{ tx: Transaction }>(
      `${TX_MATCH_BASE} WHERE t.id = $id ${TX_RETURN}`,
      { id }
    );
    return row?.tx ?? null;
  }

  static async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
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
        date: data.date,
        amount: data.amount,
        description: data.description,
        type: data.type,
        status: data.status,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        fromAccount: data.fromAccount ?? null,
        toAccount: data.toAccount ?? null,
        merchant: data.merchant ?? null,
        category: data.category ?? null,
      }
    );

    const tx = await this.getById(id);
    if (!tx) throw new Error('Failed to create transaction');
    return tx;
  }
}
