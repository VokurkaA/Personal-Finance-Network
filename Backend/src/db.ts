import neo4j, { Driver, Session, Integer } from 'neo4j-driver';

let driver: Driver | null = null;

type NeoNode = { labels: string[]; properties: Record<string, unknown>; identity: unknown };
type NeoRel  = { type: string; properties: Record<string, unknown>; identity: unknown; start: unknown; end: unknown };

function isNeoNode(v: unknown): v is NeoNode {
  return typeof v === 'object' && v !== null && Array.isArray((v as NeoNode).labels) && 'properties' in (v as NeoNode);
}
function isNeoRel(v: unknown): v is NeoRel {
  return typeof v === 'object' && v !== null && typeof (v as NeoRel).type === 'string' && 'properties' in (v as NeoRel) && 'start' in (v as NeoRel);
}

/**
 * Recursively convert Neo4j types to plain JS values:
 * - Node  → its .properties (recursively flattened)
 * - Relationship → its .properties (recursively flattened)
 * - Integer → number
 * - Arrays / plain objects are traversed
 */
export function toPlain(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value as Integer)) {
    return (value as Integer).toNumber();
  }
  if (isNeoNode(value)) return toPlain(value.properties);
  if (isNeoRel(value))  return toPlain(value.properties);
  if (Array.isArray(value)) {
    return (value as unknown[]).map(toPlain);
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = toPlain(v);
    }
    return result;
  }
  return value;
}

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER ?? 'neo4j';
    const password = process.env.NEO4J_PASSWORD ?? 'password';
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session: Session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => toPlain(r.toObject()) as T);
  } finally {
    await session.close();
  }
}

export async function runQuerySingle<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await runQuery<T>(cypher, params);
  return rows[0] ?? null;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
