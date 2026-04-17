// ============================================================
//  policy.ts
//  Use cases for the Policy model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, name])  — policy names unique per tenant
//    @@index([tenantId])
//    @@index([deletedAt])
//    tenantId non-nullable       — all policies belong to a tenant
//    permissions String[]        — required array, stored as Postgres text[]
//    isManaged Boolean           — true = platform-seeded, cannot be edited
//    rolePolicies RolePolicy[]   — explicit join table _role_policies
//    deletedAt soft-delete
//
//  All policies are implicitly ALLOW — the system is deny-by-default.
//  Per-user overrides live on IdentityPermission, not here.
// ============================================================

import type {
  Policy,
  Prisma,
  Role,
  RolePolicy,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
import type {
  CreatePolicyInput,
  ListPoliciesInput,
  UpdatePolicyInput,
} from "./types.js";

// ─── Composite types ─────────────────────────────────────────

export type PolicyWithRoles = Policy & {
  rolePolicies: (RolePolicy & { role: Role })[];
};

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Policy.
// Throws P2002 if [tenantId, name] already exists.
// permissions is stored as a Postgres text[] array —
// Prisma requires { set: [] } on create for array fields.
const createPolicy = async (input: CreatePolicyInput): Promise<Policy> => {
  return prisma.policy.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      permissions: { set: input.permissions },
      isManaged: input.isManaged ?? false,
    },
  });
};

// ─── Read ─────────────────────────────────────────────────────

// Finds a non-deleted policy by primary key.
const getPolicyById = async (id: string): Promise<Policy | null> => {
  return prisma.policy.findFirst({
    where: { id, deletedAt: null },
  });
};

// Finds a non-deleted policy by [tenantId, name].
// Uses @@unique([tenantId, name]).
const getPolicyByName = async (
  tenantId: string,
  name: string,
): Promise<Policy | null> => {
  return prisma.policy.findFirst({
    where: { tenantId, name, deletedAt: null },
  });
};

// Returns a policy with its attached roles included (via explicit join table).
const getPolicyWithRoles = async (
  id: string,
): Promise<PolicyWithRoles | null> => {
  return prisma.policy.findFirst({
    where: { id, deletedAt: null },
    include: { rolePolicies: { include: { role: true } } },
  });
};

// Returns multiple non-deleted policies by their IDs in a single query.
const getPoliciesByIds = async (ids: string[]): Promise<Policy[]> => {
  return prisma.policy.findMany({
    where: { id: { in: ids }, deletedAt: null },
  });
};

// ─── Paginated list ────────────────────────────────────────────

const buildWhere = (
  input: Omit<ListPoliciesInput, "page" | "limit">,
): Prisma.PolicyWhereInput => ({
  tenantId: input.tenantId,
  deletedAt: null,
  ...(input.isManaged !== undefined && { isManaged: input.isManaged }),
  ...(input.search !== undefined &&
    input.search.length > 0 && {
      OR: [
        { name: { contains: input.search, mode: "insensitive" } },
        { displayName: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

// Returns a paginated list of policies for a tenant.
// isManaged filter distinguishes platform-seeded from tenant-created policies.
const listPolicies = async (
  input: ListPoliciesInput,
): Promise<PaginatedResult<Policy>> => {
  const where = buildWhere(input);
  const { skip, take } = buildPaginationQuery(input);

  const [data, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.policy.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Update ──────────────────────────────────────────────────

// Updates mutable fields on an existing policy.
// Throws P2002 if updated name collides within the same tenant.
// Throws P2025 if the policy does not exist.
// Array fields use { set: [] } to replace the full array atomically.
const updatePolicy = async (
  id: string,
  input: UpdatePolicyInput,
): Promise<Policy> => {
  return prisma.policy.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.displayName !== undefined && {
        displayName: input.displayName,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.permissions !== undefined && {
        permissions: { set: input.permissions },
      }),
    },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

const softDeletePolicy = async (id: string): Promise<Policy> => {
  return prisma.policy.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const restorePolicy = async (id: string): Promise<Policy> => {
  return prisma.policy.update({
    where: { id },
    data: { deletedAt: null },
  });
};

export {
  createPolicy,
  getPolicyById,
  getPolicyByName,
  getPolicyWithRoles,
  getPoliciesByIds,
  listPolicies,
  updatePolicy,
  softDeletePolicy,
  restorePolicy,
};
