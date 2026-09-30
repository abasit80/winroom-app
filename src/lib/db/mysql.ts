import fs from "fs";
import path from "path";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  winroomPool?: Pool;
  winroomDbReady?: Promise<void>;
};

function dbName() {
  return process.env.DB_NAME ?? "winroom";
}

function poolConfig(withDatabase = true) {
  const sslEnabled = process.env.DB_SSL === "true" || process.env.DB_SSL === "1";
  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    ...(withDatabase ? { database: dbName() } : {}),
    ...(sslEnabled ? { ssl: { rejectUnauthorized: true } } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
  };
}

function schemaStatements() {
  const sql = fs.readFileSync(path.join(process.cwd(), "sql", "winroom.sql"), "utf8");
  return sql
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

async function ensureSchema() {
  const bootstrap = await mysql.createConnection(poolConfig(false));
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName()}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await bootstrap.end();

  const pool = mysql.createPool(poolConfig(true));
  const conn = await pool.getConnection();
  try {
    const [tables] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'schema_migrations'",
      [dbName()],
    );
    if (Number(tables[0]?.n) === 0) {
      for (const statement of schemaStatements()) {
        await conn.query(statement);
      }
      await conn.query("INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?)", [new Date().toISOString()]);
    }
  } finally {
    conn.release();
  }

  globalForDb.winroomPool = pool;
}

export async function getPool() {
  if (!globalForDb.winroomDbReady) {
    globalForDb.winroomDbReady = ensureSchema();
  }
  await globalForDb.winroomDbReady;
  return globalForDb.winroomPool!;
}

export async function query<T extends RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const pool = await getPool();
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function exec(sql: string) {
  const pool = await getPool();
  await pool.query(sql);
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export type { PoolConnection, ResultSetHeader, RowDataPacket };
