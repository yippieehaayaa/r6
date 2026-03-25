import { getRoleById } from "@r6/db-identity-and-access";
import { AppError } from "../../lib/errors";

export const ensureRoleBelongsToTenant = async (
  id: string,
  tenantId: string,
) => {
  const role = await getRoleById(id);
  if (!role) throw new AppError(404, "not_found", "Role not found");
  if (role.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Role does not belong to this tenant",
    );
  }
  return role;
};
