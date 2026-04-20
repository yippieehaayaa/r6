// ============================================================
//  totp.ts — IAM API re-export shim
//
//  All TOTP crypto logic now lives in the shared @r6/totp package.
//  This file re-exports everything from that package so existing
//  imports inside this service continue to work without change.
//
//  Import directly from @r6/totp in new code; this shim is
//  retained for backward compatibility with existing controllers.
// ============================================================

export {
  decryptTotpSecret,
  encryptTotpSecret,
  generateQrDataUrl,
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
} from "@r6/totp";
