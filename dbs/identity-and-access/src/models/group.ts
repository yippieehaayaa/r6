import { type Prisma, prisma } from "../client";
import {
  GroupNameExistsError,
  GroupNotFoundError,
  IdentityNotFoundError,
  RoleNotFoundError,
} from "../errors";

export type CreateGroupInput = {
  name: string;
  description?: string;
};

export type UpdateGroupInput = {
  name?: string;
  description?: string;
};

export type ListGroupsInput = {
  page: number;
  limit: number;
  search?: string;
};

const buildGroupWhere = (
  input: Pick<ListGroupsInput, "search">,
): Prisma.GroupWhereInput => ({
  deletedAt: null,
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const createGroup = async (input: CreateGroupInput) => {
  try {
    return await prisma.group.create({
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
      throw new GroupNameExistsError();
    }
    throw error;
  }
};

const getGroupById = async (id: string) => {
  const group = await prisma.group.findUnique({
    where: { id, deletedAt: null },
  });

  if (!group) throw new GroupNotFoundError();

  return group;
};

const updateGroup = async (id: string, input: UpdateGroupInput) => {
  const group = await prisma.group.findUnique({
    where: { id, deletedAt: null },
  });

  if (!group) throw new GroupNotFoundError();

  try {
    return await prisma.group.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new GroupNameExistsError();
    }
    throw error;
  }
};

const deleteGroup = async (id: string) => {
  const group = await prisma.group.findUnique({
    where: { id, deletedAt: null },
  });

  if (!group) throw new GroupNotFoundError();

  return await prisma.group.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const listGroups = async (input: ListGroupsInput) => {
  const where = buildGroupWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.group.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

const addIdentityToGroup = async (groupId: string, identityId: string) => {
  const [group, identity] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
    prisma.identity.findUnique({ where: { id: identityId, deletedAt: null } }),
  ]);

  if (!group) throw new GroupNotFoundError();
  if (!identity) throw new IdentityNotFoundError();

  return await prisma.group.update({
    where: { id: groupId },
    data: { identities: { connect: { id: identityId } } },
  });
};

const removeIdentityFromGroup = async (groupId: string, identityId: string) => {
  const [group, identity] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
    prisma.identity.findUnique({ where: { id: identityId, deletedAt: null } }),
  ]);

  if (!group) throw new GroupNotFoundError();
  if (!identity) throw new IdentityNotFoundError();

  return await prisma.group.update({
    where: { id: groupId },
    data: { identities: { disconnect: { id: identityId } } },
  });
};

const addRoleToGroup = async (groupId: string, roleId: string) => {
  const [group, role] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
  ]);

  if (!group) throw new GroupNotFoundError();
  if (!role) throw new RoleNotFoundError();

  return await prisma.group.update({
    where: { id: groupId },
    data: { roles: { connect: { id: roleId } } },
  });
};

const removeRoleFromGroup = async (groupId: string, roleId: string) => {
  const [group, role] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId, deletedAt: null } }),
    prisma.role.findUnique({ where: { id: roleId, deletedAt: null } }),
  ]);

  if (!group) throw new GroupNotFoundError();
  if (!role) throw new RoleNotFoundError();

  return await prisma.group.update({
    where: { id: groupId },
    data: { roles: { disconnect: { id: roleId } } },
  });
};

export default {
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  listGroups,
  addIdentityToGroup,
  removeIdentityFromGroup,
  addRoleToGroup,
  removeRoleFromGroup,
} as const;
