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
  const identity = await getIdentityById(id);
  if (!identity) throw new AppError(404, "not_found", "Identity not found");
  if (identity.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Identity does not belong to this tenant",
    );
  }
  return identity;
};
