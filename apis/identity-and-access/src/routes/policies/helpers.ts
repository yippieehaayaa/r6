import type { Policy } from "@r6/db-identity-and-access";
import { getPolicyById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";
import { ensureTenantExistsBySlug } from "../tenants/helpers";

export const ensurePolicyExists = async (id: string) => {
  const policy = await getPolicyById(id);
  if (!policy) throw new AppError(404, "not_found", "Policy not found");
  return policy;
};

// Throws 403 if the policy's audience is not fully contained within the
// tenant's availed modules. Every audience entry must be present in
// moduleAccess — partial overlap is not sufficient.
export const ensurePolicyInModuleScope = (
  policy: Policy,
  moduleAccess: string[],
): void => {
  const outOfScope = policy.audience.filter((a) => !moduleAccess.includes(a));
  if (outOfScope.length > 0) {
    throw new AppError(
      403,
      "forbidden",
      "Policy is not available for your subscribed services",
    );
  }
};

// Resolves a tenantSlug to its moduleAccess array.
// Throws 404 via ensureTenantExistsBySlug if the tenant does not exist.
export const resolveTenantModuleAccess = async (
  tenantSlug: string,
): Promise<string[]> => {
  const tenant = await ensureTenantExistsBySlug(tenantSlug);
  return tenant.moduleAccess;
};
