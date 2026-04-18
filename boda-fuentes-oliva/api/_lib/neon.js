import pg from 'pg';

const { Pool } = pg;

function getConnectionString() {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
}

function getPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error('Missing NEON_DATABASE_URL environment variable');
  }

  if (!globalThis.__neonPool) {
    globalThis.__neonPool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 10 : 5
    });
  }

  return globalThis.__neonPool;
}

export async function query(text, params = []) {
  const pool = getPool();
  return pool.query(text, params);
}
