import { getTenantById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const ensureTenantExists = async (tenantId: string) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  return tenant;
};
