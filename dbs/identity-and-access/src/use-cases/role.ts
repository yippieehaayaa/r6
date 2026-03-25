// ============================================================
//  role.ts
//  Use cases for the Role model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, name])   — role names unique per tenant
//    @@index([tenantId])
//    @@index([tenantId, isActive])
//    @@index([deletedAt])
//    tenantId nullable            — null for platform-level roles
//    policies Policy[]            — many-to-many implicit join
//    identities Identity[]        — many-to-many implicit join
//    isActive default true
//    deletedAt soft-delete
// ============================================================

import type {
  Identity,
  Policy,
  Prisma,
  Role,
} from "../../generated/prisma/client";
import { prisma } from "../client";
import type {
  AttachPolicyInput,
  CreateRoleInput,
  ListRolesInput,
  PaginatedResult,
  UpdateRoleInput,
} from "./types";

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
}

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted role by primary key.
const getRoleById = async (id: string): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
  });
}

// Finds a non-deleted role by [tenantId, name].
// Uses @@unique([tenantId, name]).
const getRoleByName = async (
  tenantId: string | null,
  name: string,
): Promise<Role | null> => {
  return prisma.role.findFirst({
    where: { tenantId, name, deletedAt: null },
  });
}

// Returns a role with its attached policies included.
const getRoleWithPolicies = async (
  id: string,
): Promise<(Role & { policies: Policy[] }) | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
    include: { policies: true },
  });
}

// Returns a role with its assigned identities included.
const getRoleWithIdentities = async (
  id: string,
): Promise<(Role & { identities: Identity[] }) | null> => {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
    include: { identities: true },
  });
}

// ─── Paginated list ──────────────────────────────────────────

const buildWhere = (
  input: Omit<ListRolesInput, "page" | "limit">,
): Prisma.RoleWhereInput => ({
  tenantId: input.tenantId,
  deletedAt: null,
  ...(input.isActive !== undefined && { isActive: input.isActive }),
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
}

// Lists platform-level roles (tenantId = null) — paginated.
// Used only by ADMIN identities.
const listPlatformRoles = async (input: {
  page: number;
  limit: number;
}): Promise<PaginatedResult<Role>> => {
  const where: Prisma.RoleWhereInput = { tenantId: null, deletedAt: null };
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
}

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
}

// ─── Policy assignment (many-to-many) ────────────────────────

// Attaches an existing Policy to a Role.
// Prisma manages the implicit join table.
// Throws P2025 if either role or policy does not exist.
// Attaching the same policy twice is a no-op.
const attachPolicyToRole = async (
  input: AttachPolicyInput,
): Promise<Role & { policies: Policy[] }> => {
  return prisma.role.update({
    where: { id: input.roleId },
    data: {
      policies: { connect: { id: input.policyId } },
    },
    include: { policies: true },
  });
}

// Detaches a Policy from a Role.
// No-op if the policy was not attached.
// Throws P2025 if the role does not exist.
const detachPolicyFromRole = async (
  input: AttachPolicyInput,
): Promise<Role & { policies: Policy[] }> => {
  return prisma.role.update({
    where: { id: input.roleId },
    data: {
      policies: { disconnect: { id: input.policyId } },
    },
    include: { policies: true },
  });
}

// Replaces all policies attached to a role in one atomic write.
// set: [] disconnects all current policies then connects the new set.
const setPoliciesForRole = async (
  roleId: string,
  policyIds: string[],
): Promise<Role & { policies: Policy[] }> => {
  return prisma.role.update({
    where: { id: roleId },
    data: {
      policies: { set: policyIds.map((id) => ({ id })) },
    },
    include: { policies: true },
  });
}

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a role.
// Implicit join rows (role ↔ identity, role ↔ policy) are NOT
// removed — Prisma's implicit many-to-many does not cascade
// soft-deletes. Active identities with this role will stop
// seeing it in queries filtered by deletedAt: null.
const softDeleteRole = async (id: string): Promise<Role> => {
  return prisma.role.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

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
