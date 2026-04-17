// ============================================================
//  role.ts
//  Use cases for the Role model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, name])   — role names unique per tenant
//    @@index([tenantId])
//    @@index([tenantId, isActive])
//    @@index([deletedAt])
//    tenantId non-nullable        — all roles belong to a tenant
//    rolePolicies RolePolicy[]   — explicit M2M join table
//    identityRoles IdentityRole[] — explicit M2M join table
//    isActive default true
//    isManaged Boolean            — true = platform-seeded, cannot be edited
//    deletedAt soft-delete
// ============================================================

import type {
  Identity,
  IdentityRole,
  Policy,
  Prisma,
  Role,
  RolePolicy,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
import type {
  AttachPolicyInput,
  CreateRoleInput,
  ListRolesInput,
  UpdateRoleInput,
} from "./types.js";

// ─── Shared return types ─────────────────────────────────────

export type RoleWithPolicies = Role & {
  rolePolicies: (RolePolicy & { policy: Policy })[];
};

export type RoleWithIdentities = Role & {
  identityRoles: (IdentityRole & { identity: Identity })[];
};

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Role.
// Throws P2002 if [tenantId, name] already exists.
const createRole = async (input: CreateRoleInput): Promise<Role> => {
  return prisma.role.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      isManaged: input.isManaged ?? false,
      // isActive uses schema default true
    },
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted role by primary key within a tenant.
const getRoleById = async (
  id: string,
  tenantId: string,
): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
};

const getRoleByName = async (
  tenantId: string,
  name: string,
): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { tenantId, name, deletedAt: null },
  });
};

const getRoleWithPolicies = async (
  id: string,
  tenantId: string,
): Promise<RoleWithPolicies | null> => {
  return prisma.role.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: { rolePolicies: { include: { policy: true } } },
  });
};

const getRoleWithIdentities = async (
  id: string,
  tenantId: string,
): Promise<RoleWithIdentities | null> => {
  return prisma.role.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: { identityRoles: { include: { identity: true } } },
  });
};

// ─── Paginated list ──────────────────────────────────────────

const buildWhere = (
  input: Omit<ListRolesInput, "page" | "limit">,
): Prisma.RoleWhereInput => ({
  tenantId: input.tenantId,
  deletedAt: null,
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.search !== undefined &&
    input.search.length > 0 && {
      OR: [
        { name: { contains: input.search, mode: "insensitive" } },
        { displayName: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

const listRoles = async (
  input: ListRolesInput,
): Promise<PaginatedResult<Role>> => {
  const where = buildWhere(input);
  const { skip, take } = buildPaginationQuery(input);

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Update ──────────────────────────────────────────────────

// Updates mutable fields on an existing role.
// Verifies the role belongs to tenantId before writing — prevents cross-tenant mutation.
// Throws P2002 if updated name collides within the same tenant.
const updateRole = async (
  id: string,
  tenantId: string,
  input: UpdateRoleInput,
): Promise<Role> => {
  const existing = await getRoleById(id, tenantId);
  if (!existing) throw new Error("not_found");
  return prisma.role.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.displayName !== undefined && {
        displayName: input.displayName,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
};

// ─── Policy assignment (many-to-many) ────────────────────────

// Inserts a row into the explicit _role_policies join table.
// Verifies the role belongs to tenantId before inserting.
// Throws P2002 if the same [roleId, policyId] already exists.
// Throws P2025 if the policy does not exist.
const attachPolicyToRole = async (
  input: AttachPolicyInput,
): Promise<RolePolicy> => {
  const role = await getRoleById(input.roleId, input.tenantId);
  if (!role) throw new Error("not_found");
  return prisma.rolePolicy.create({
    data: { roleId: input.roleId, policyId: input.policyId },
  });
};

const detachPolicyFromRole = async (
  input: AttachPolicyInput,
): Promise<RolePolicy> => {
  const role = await getRoleById(input.roleId, input.tenantId);
  if (!role) throw new Error("not_found");
  return prisma.rolePolicy.delete({
    where: {
      roleId_policyId: { roleId: input.roleId, policyId: input.policyId },
    },
  });
};

const setPoliciesForRole = async (
  roleId: string,
  tenantId: string,
  policyIds: string[],
): Promise<void> => {
  const role = await getRoleById(roleId, tenantId);
  if (!role) throw new Error("not_found");
  await prisma.$transaction([
    prisma.rolePolicy.deleteMany({ where: { roleId } }),
    prisma.rolePolicy.createMany({
      data: policyIds.map((policyId) => ({ roleId, policyId })),
      skipDuplicates: true,
    }),
  ]);
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a role.
// Verifies the role belongs to tenantId before writing.
// RolePolicy and IdentityRole join rows are left intact — they are
// removed by CASCADE only on hard-delete.
const softDeleteRole = async (id: string, tenantId: string): Promise<Role> => {
  const existing = await getRoleById(id, tenantId);
  if (!existing) throw new Error("not_found");
  return prisma.role.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
};

const restoreRole = async (id: string): Promise<Role> => {
  return prisma.role.update({
    where: { id },
    data: { deletedAt: null, isActive: true },
  });
};

export {
  createRole,
  getRoleById,
  getRoleByName,
  getRoleWithPolicies,
  getRoleWithIdentities,
  listRoles,
  updateRole,
  attachPolicyToRole,
  detachPolicyFromRole,
  setPoliciesForRole,
  softDeleteRole,
  restoreRole,
};
