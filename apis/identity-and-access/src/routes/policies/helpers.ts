import { getPolicyById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const ensurePolicyExists = async (id: string) => {
  const policy = await getPolicyById(id);
  if (!policy) throw new AppError(404, "not_found", "Policy not found");
  return policy;
};
