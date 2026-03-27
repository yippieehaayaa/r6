import { getPolicyById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const ensurePolicyBelongsToTenant = async (
  id: string,
  tenantId: string,
) => {
  const policy = await getPolicyById(id);
  if (!policy) throw new AppError(404, "not_found", "Policy not found");
  if (policy.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Policy does not belong to this tenant",
    );
  }
  return policy;
};
