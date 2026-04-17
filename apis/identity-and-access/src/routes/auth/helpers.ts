// Structural types for token-claim building — avoids depending on
// Prisma model types flowing through the package boundary.
type PermissionClaim = { permission: string; effect: string };
export type IdentityForToken = {
  id: string;
  kind: string;
  tenantId: string | null;
  identityPermissions: PermissionClaim[];
};

export const buildTokenClaims = (identity: IdentityForToken) => {
  const allowSet = new Set<string>();
  const denySet = new Set<string>();
  for (const p of identity.identityPermissions) {
    if (p.effect === "ALLOW") allowSet.add(p.permission);
    else denySet.add(p.permission);
  }
  const permissions = [...allowSet].filter((p) => !denySet.has(p));
  return { permissions };
};

export const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};
