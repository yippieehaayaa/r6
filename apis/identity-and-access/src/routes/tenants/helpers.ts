import { randomInt } from "node:crypto";
import { getTenantById, getTenantBySlug } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

// ── Password utilities ────────────────────────────────────────────────────────

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

/**
 * Returns a single cryptographically random character from the given alphabet.
 */
export function randomChar(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)] as string;
}

/**
 * Generates a cryptographically random 16-character password that satisfies
 * complexity requirements (upper, lower, digit, special).
 * Uses Node's built-in crypto.randomInt — no external dependencies.
 */
export function generatePassword(): string {
  const chars: string[] = [
    randomChar(UPPER),
    randomChar(LOWER),
    randomChar(DIGITS),
    randomChar(SPECIAL),
  ];
  for (let i = 4; i < 16; i++) {
    chars.push(randomChar(ALL));
  }
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = chars[i] as string;
    chars[i] = chars[j] as string;
    chars[j] = tmp;
  }
  return chars.join("");
}

// ── Tenant lookups ────────────────────────────────────────────────────────────

export const ensureTenantExists = async (tenantId: string) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  return tenant;
};

export const ensureTenantExistsBySlug = async (slug: string) => {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  return tenant;
};
