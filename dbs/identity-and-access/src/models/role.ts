import { type Prisma, prisma } from "../client";
import {
  GroupNotFoundError,
  IdentityNotFoundError,
  PolicyNotFoundError,
  RoleNameExistsError,
  RoleNotFoundError,
} from "../errors";

export type CreateRoleInput = {
  name: string;
  description?: string;
};

export type UpdateRoleInput = {
  name?: string;
  description?: string;
};

export type ListRolesInput = {
  page: number;
  limit: number;
  search?: string;
};

const buildRoleWhere = (
  input: Pick<ListRolesInput, "search">,
): Prisma.RoleWhereInput => ({
  deletedAt: null,
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const createRole = async (input: CreateRoleInput) => {
  try {
    return await prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new RoleNameExistsError();
    }
    throw error;
  }
};

const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id, deletedAt: null },
  });

  if (!role) throw new RoleNotFoundError();

  return role;
};

const updateRole = async (id: string, input: UpdateRoleInput) => {
  const role = await prisma.role.findUnique({
    where: { id, deletedAt: null },
  });

  if (!role) throw new RoleNotFoundError();

  try {
    return await prisma.role.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new RoleNameExistsError();
    }
    throw error;
  }
};

const deleteRole = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id, deletedAt: null },
  });

  if (!role) throw new RoleNotFoundError();

  return await prisma.role.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const listRoles = async (input: ListRolesInput) => {
  const where = buildRoleWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

const assignRoleToIdentity = async (roleId: string, identityId: string) => {
  const [role, identity] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.identity.findUnique({ where: { id: identityId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!identity) throw new IdentityNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { identities: { connect: { id: identityId } } },
  });
};

const removeRoleFromIdentity = async (roleId: string, identityId: string) => {
  const [role, identity] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.identity.findUnique({ where: { id: identityId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!identity) throw new IdentityNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { identities: { disconnect: { id: identityId } } },
  });
};

const assignRoleToGroup = async (roleId: string, groupId: string) => {
  const [role, group] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!group) throw new GroupNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { groups: { connect: { id: groupId } } },
  });
};

const removeRoleFromGroup = async (roleId: string, groupId: string) => {
  const [role, group] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!group) throw new GroupNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { groups: { disconnect: { id: groupId } } },
  });
};

const assignPolicyToRole = async (roleId: string, policyId: string) => {
  const [role, policy] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.policy.findUnique({ where: { id: policyId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!policy) throw new PolicyNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { policies: { connect: { id: policyId } } },
  });
};

const removePolicyFromRole = async (roleId: string, policyId: string) => {
  const [role, policy] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
    prisma.policy.findUnique({ where: { id: policyId, deletedAt: null } }),
  ]);

  if (!role) throw new RoleNotFoundError();
  if (!policy) throw new PolicyNotFoundError();

  return await prisma.role.update({
    where: { id: roleId },
    data: { policies: { disconnect: { id: policyId } } },
  });
};

export default {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  listRoles,
  assignRoleToIdentity,
  removeRoleFromIdentity,
  assignRoleToGroup,
  removeRoleFromGroup,
  assignPolicyToRole,
  removePolicyFromRole,
} as const;
