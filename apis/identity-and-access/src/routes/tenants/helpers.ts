import { getTenantById, getTenantBySlug } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const ensureTenantExists = async (tenantId: string) => {
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  return tenant;
};

export const ensureTenantExistsBySlug = async (slug: string) => {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  return tenant;
};
