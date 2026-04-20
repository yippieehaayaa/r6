// ============================================================
//  constants.ts
//  Auth/lockout constants for the identity-and-access db package.
//  Business-rule constants (e.g. default role policies) belong
//  in the API layer — not here.
// ============================================================

// ─── Login / lockout ─────────────────────────────────────────

// Maximum consecutive failed login attempts before the account is locked.
export const LOGIN_MAX_ATTEMPTS = 5;

// Lock duration in milliseconds after hitting max failed attempts (15 min).
export const LOGIN_LOCK_MS = 15 * 60 * 1000;
