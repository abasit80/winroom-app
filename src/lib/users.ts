import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { findUserRow, insertUser, type UserRecord } from "@/lib/db/users";

export type StoredUser = UserRecord;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const current = Buffer.from(hash, "hex");
  if (current.length !== next.length) return false;
  return timingSafeEqual(current, next);
}

export async function findUserByEmail(email: string) {
  return findUserRow(email);
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (await findUserByEmail(email)) {
    return { error: "An account with this email already exists. Log in instead." as const };
  }
  const user: StoredUser = {
    id: randomBytes(12).toString("hex"),
    name,
    email,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await insertUser(user);
  return { user };
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "No account found for that email. Sign up first." as const };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect password." as const };
  }
  return { user };
}

export function publicUser(user: StoredUser) {
  return { id: user.id, name: user.name, email: user.email };
}
