import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { env } from "../config";

// ─── Encryption helpers (AES-256-GCM) ───────────────────────
//
// Format stored in DB:  <16-byte IV hex><32-byte auth-tag hex><ciphertext hex>
// Total overhead: 32 + 64 = 96 hex chars of prefix.

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 16;
const TAG_BYTES = 16;

const getKey = (): Buffer =>
  Buffer.from(env.TOTP_ENCRYPTION_KEY, "hex");

export const encryptTotpSecret = (plaintext: string): string => {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + tag.toString("hex") + encrypted.toString("hex");
};

export const decryptTotpSecret = (ciphertext: string): string => {
  const ivHex = ciphertext.slice(0, IV_BYTES * 2);
  const tagHex = ciphertext.slice(IV_BYTES * 2, (IV_BYTES + TAG_BYTES) * 2);
  const encHex = ciphertext.slice((IV_BYTES + TAG_BYTES) * 2);

  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};

// ─── TOTP helpers ────────────────────────────────────────────

// otplib defaults: SHA-1, 6 digits, 30-second window.
// Allow 1 step of drift (±30 s) to handle minor clock skew.
authenticator.options = { window: 1 };

export const generateTotpSecret = (): string => authenticator.generateSecret();

export const generateTotpUri = (
  secret: string,
  accountName: string,
  issuer: string,
): string => authenticator.keyuri(accountName, issuer, secret);

export const generateQrDataUrl = async (otpauthUri: string): Promise<string> =>
  QRCode.toDataURL(otpauthUri);

/**
 * Verifies a 6-digit TOTP code against an *encrypted* secret from the DB.
 * Decrypts the secret internally so the plaintext never escapes this module.
 */
export const verifyTotpCode = (encryptedSecret: string, code: string): boolean => {
  try {
    const secret = decryptTotpSecret(encryptedSecret);
    return authenticator.check(code, secret);
  } catch {
    return false;
  }
};
