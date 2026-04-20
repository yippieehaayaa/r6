// Structural types for token-claim building — avoids depending on
// Prisma model types flowing through the package boundary.
type PermissionClaim = { permission: string };
export type IdentityForToken = {
  id: string;
  kind: string;
  tenantId: string | null;
  identityPermissions: PermissionClaim[];
};

export const buildTokenClaims = (identity: IdentityForToken) => {
  const permissions = identity.identityPermissions.map((p) => p.permission);
  return { permissions };
};
