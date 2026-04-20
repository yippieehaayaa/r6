import type { Invitation } from "@r6/db-identity-and-access";
import type { Request } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../../middleware/auth";

// Asserts the caller belongs to the target tenant.
// Throws AppError(403) so callers can rely on the surrounding try/catch.
export function assertTenantAccess(
  payload: AuthJwtPayload,
  tenantId: string,
): void {
  if (payload.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "You do not have access to this tenant",
    );
  }
}

// Resolves a route parameter to a plain string.
// Express 5 types req.params values as string | string[] — path parameters are
// always a single string; this helper normalises the type for type-safe usage.
export function resolveParam(req: Request, name: string): string | undefined {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

// Strips the internal tokenHash field before sending an invitation to a client.
export function toSafeInvitation<T extends Pick<Invitation, "tokenHash">>(
  invitation: T,
): Omit<T, "tokenHash"> {
  const { tokenHash: _stripped, ...safe } = invitation;
  return safe;
}
