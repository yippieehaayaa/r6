import { getIdentityById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};

export const ensureIdentityBelongsToTenant = async (
  id: string,
  tenantId: string,
) => {
  const identity = await getIdentityById(id, tenantId);
  if (!identity) throw new AppError(404, "not_found", "Identity not found");
  return identity;
};

export const ensureIdentityBelongsToTenantWithDetails = async (
  id: string,
  tenantId: string,
) => {
  const identity = await getIdentityById(id, tenantId);
  if (!identity) throw new AppError(404, "not_found", "Identity not found");
  return identity;
};
