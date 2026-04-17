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
//                                   Platform roles use the platform tenant
//    rolePolicies RolePolicy[]   — explicit M2M join table
//    identityRoles IdentityRole[] — explicit M2M join table
//    isActive default true
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
import type {
  AttachPolicyInput,
  CreateRoleInput,
  ListRolesInput,
  PaginatedResult,
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
      description: input.description,
      // isActive uses schema default true
    },
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted role by primary key.
const getRoleById = async (id: string): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
  });
};

// Finds a non-deleted role by [tenantId, name].
// Uses @@unique([tenantId, name]).
const getRoleByName = async (
  tenantId: string,
  name: string,
): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { tenantId, name, deletedAt: null },
  });
};

// Returns a role with its attached policies included (via explicit join table).
const getRoleWithPolicies = async (
  id: string,
): Promise<RoleWithPolicies | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
    include: { rolePolicies: { include: { policy: true } } },
  });
};

// Returns a role with its assigned identities included (via explicit join table).
const getRoleWithIdentities = async (
  id: string,
): Promise<RoleWithIdentities | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
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
        { description: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

// Returns a paginated list of roles for a tenant.
// isActive filter uses @@index([tenantId, isActive]).
// Runs findMany + count in parallel — same pattern as listMovements.
const listRoles = async (
  input: ListRolesInput,
): Promise<PaginatedResult<Role>> => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { name: "asc" },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// Lists platform-level roles — paginated.
// platformTenantId is the ID of the platform tenant (isPlatform = true).
const listPlatformRoles = async (
  platformTenantId: string,
  input: { page: number; limit: number },
): Promise<PaginatedResult<Role>> => {
  const where: Prisma.RoleWhereInput = {
    tenantId: platformTenantId,
    deletedAt: null,
  };
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { name: "asc" },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Update ──────────────────────────────────────────────────

// Updates mutable fields on an existing role.
// Throws P2002 if updated name collides within the same tenant.
// Throws P2025 if the role does not exist.
const updateRole = async (
  id: string,
  input: UpdateRoleInput,
): Promise<Role> => {
  return prisma.role.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
};

// ─── Policy assignment (many-to-many) ────────────────────────

// Inserts a row into the explicit _role_policies join table.
// Throws P2002 if the same [roleId, policyId] already exists.
// Throws P2025 if either the role or policy does not exist.
const attachPolicyToRole = async (
  input: AttachPolicyInput,
): Promise<RolePolicy> => {
  return prisma.rolePolicy.create({
    data: { roleId: input.roleId, policyId: input.policyId },
  });
};

// Removes a row from the explicit _role_policies join table.
// Throws P2025 if the [roleId, policyId] row does not exist.
const detachPolicyFromRole = async (
  input: AttachPolicyInput,
): Promise<RolePolicy> => {
  return prisma.rolePolicy.delete({
    where: {
      roleId_policyId: { roleId: input.roleId, policyId: input.policyId },
    },
  });
};

// Replaces all policies attached to a role atomically.
// Deletes all existing join rows then inserts the new set in one transaction.
const setPoliciesForRole = async (
  roleId: string,
  policyIds: string[],
): Promise<void> => {
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
// RolePolicy and IdentityRole join rows are left intact — they are
// removed by CASCADE only on hard-delete.
const softDeleteRole = async (id: string): Promise<Role> => {
  return prisma.role.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
};

// Restores a soft-deleted role.
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
  listPlatformRoles,
  updateRole,
  attachPolicyToRole,
  detachPolicyFromRole,
  setPoliciesForRole,
  softDeleteRole,
  restoreRole,
};
