import { v4 as uuidv4 } from 'uuid';
import { runQuery, runQuerySingle } from '../db';
import type { Account } from '../types';

export class AccountService {
  static async getAll(): Promise<Account[]> {
    const rows = await runQuery<{ a: Account }>(
      'MATCH (a:Account) RETURN a ORDER BY a.createdAt ASC'
    );
    return rows.map((r) => r.a);
  }

  static async getById(id: string): Promise<Account | null> {
    const row = await runQuerySingle<{ a: Account }>(
      'MATCH (a:Account {id: $id}) RETURN a',
      { id }
    );
    return row?.a ?? null;
  }

  static async create(data: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const row = await runQuerySingle<{ a: Account }>(
      `MATCH (u:User {id: $userId})
       CREATE (a:Account {id: $id, name: $name, type: $type, balance: $balance, bank: $bank, createdAt: $createdAt})
       CREATE (u)-[:HAS {primaryAccount: false}]->(a)
       RETURN a`,
      { id, ...data, createdAt, userId: 'user-001' }
    );
    if (!row) throw new Error('User not found or failed to create account');
    return row.a;
  }
}
