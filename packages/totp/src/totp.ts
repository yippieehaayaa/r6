// ============================================================
//  totp.ts — @r6/totp
//
//  All TOTP operations for the r6 platform:
//    • AES-256-GCM encryption / decryption of the raw TOTP secret
//    • Secret generation
//    • Provisioning URI (otpauth://) generation
//    • QR code data-URL generation
//    • 6-digit code verification (against an encrypted DB secret)
//
//  Security notes:
//    - The plaintext secret is only ever held in memory during setup
//      and is never returned from any function after encryption.
//    - The encryption key is read from TOTP_ENCRYPTION_KEY env var
//      at call-time so the package can be shared across services
//      that each set their own env.
//    - authenticator.options.window = 1 allows ±30 s clock skew.
// ============================================================

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";

// ─── Constants ────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm" as const;
const IV_BYTES = 16;
const TAG_BYTES = 16;
const KEY_HEX_LEN = 64; // 32 bytes expressed as a hex string

// ─── Key resolution ───────────────────────────────────────────

const getEncryptionKey = (): Buffer => {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw || raw.length !== KEY_HEX_LEN) {
    throw new Error(
      "TOTP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    );
  }
  return Buffer.from(raw, "hex");
};

// ─── AES-256-GCM encryption ───────────────────────────────────
//
// Stored format: <16-byte IV hex><16-byte auth-tag hex><ciphertext hex>
// Prefix overhead: 64 hex chars (32 + 32)

export const encryptTotpSecret = (plaintext: string): string => {
  const key = getEncryptionKey();
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

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
};

// ─── TOTP helpers ─────────────────────────────────────────────

// Allow ±30 s clock skew (1 window either side).
authenticator.options = { window: 1 };

/** Generates a new plaintext TOTP secret (Base32, 20 bytes). */
export const generateTotpSecret = (): string => authenticator.generateSecret();

/**
 * Builds an otpauth:// URI suitable for authenticator apps.
 * @param secret    - Plaintext Base32 secret.
 * @param account   - Human-readable account label (e.g. "user@example.com").
 * @param issuer    - App / service name shown in the authenticator app.
 */
export const generateTotpUri = (
  secret: string,
  account: string,
  issuer: string,
): string => authenticator.keyuri(account, issuer, secret);

/**
 * Converts an otpauth:// URI into a scannable QR code data-URL (PNG, base64).
 * The data-URL can be embedded directly in an <img src="…"> tag.
 */
export const generateQrDataUrl = (otpauthUri: string): Promise<string> =>
  QRCode.toDataURL(otpauthUri);

/**
 * Verifies a 6-digit TOTP code against the **encrypted** secret stored in the DB.
 * Decrypts the secret internally — the plaintext never escapes this function.
 *
 * Returns `false` (never throws) on any decryption or validation failure so
 * callers can treat the result uniformly without try/catch.
 */
export const verifyTotpCode = (
  encryptedSecret: string,
  code: string,
): boolean => {
  try {
    const secret = decryptTotpSecret(encryptedSecret);
    return authenticator.check(code, secret);
  } catch {
    return false;
  }
};
