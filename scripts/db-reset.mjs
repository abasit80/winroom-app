import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const tables = [
  "document_sections",
  "go_no_go_reasons",
  "team_assignments",
  "workflow_nodes",
  "matrix_items",
  "bid_documents",
  "go_no_go",
  "proposals",
  "vault_artifacts",
  "alerts",
  "audit_events",
  "leads",
  "profile_tags",
  "bids",
  "team_members",
  "workflows",
  "automations",
  "connectors",
  "company_profile",
  "billing",
  "users",
  "schema_migrations",
];

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "winroom",
  multipleStatements: true,
});

await conn.query("SET FOREIGN_KEY_CHECKS = 0");
for (const table of tables) {
  await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
}
await conn.query("SET FOREIGN_KEY_CHECKS = 1");
await conn.end();

console.log("MySQL reset complete. Restart the app to reseed winroom.");
