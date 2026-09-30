import { existsSync, readFileSync } from "fs";
import path from "path";
import { query, withTransaction, type RowDataPacket } from "./mysql";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

function fromRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function migrateJsonUsers() {
  const countRows = await query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM users");
  if (Number(countRows[0]?.n ?? 0) > 0) return;

  const file = path.join(process.cwd(), "data", "users.json");
  if (!existsSync(file)) return;

  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { users?: UserRecord[] };
    const users = Array.isArray(raw.users) ? raw.users : [];
    for (const user of users) {
      await query(
        "INSERT IGNORE INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, user.passwordHash, user.createdAt],
      );
    }
  } catch {
    /* ignore corrupt json */
  }
}

export async function findUserRow(email: string): Promise<UserRecord | null> {
  await migrateJsonUsers();
  const rows = await query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function insertUser(user: UserRecord) {
  await query("INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)", [
    user.id,
    user.name,
    user.email,
    user.passwordHash,
    user.createdAt,
  ]);
}
