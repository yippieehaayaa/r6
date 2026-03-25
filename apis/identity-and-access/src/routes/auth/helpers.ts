// Structural types for token-claim building — avoids depending on
// Prisma model types flowing through the package boundary.
type PolicyClaim = { effect: string; permissions: string[] };
type RoleForToken = { id: string; isActive: boolean; policies: PolicyClaim[] };
export type IdentityForToken = {
  id: string;
  kind: string;
  tenantId: string | null;
  roles: RoleForToken[];
};

export const buildTokenClaims = (identity: IdentityForToken) => {
  const activeRoles = identity.roles.filter((r) => r.isActive);
  const roleIds = activeRoles.map((r) => r.id);
  const permissions: string[] = [
    ...new Set(
      activeRoles.flatMap((r) =>
        r.policies
          .filter((p) => p.effect === "ALLOW")
          .flatMap((p) => p.permissions),
      ),
    ),
  ];
  return { roles: roleIds, permissions };
};

export const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};
