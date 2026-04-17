// ============================================================
//  policy.ts
//  Use cases for the Policy model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, name])   — policy names unique per tenant
//    @@index([tenantId])
//    @@index([deletedAt])
//    tenantId non-nullable        — all policies belong to a tenant
//                                   (ADMIN policies belong to the platform tenant)
//    effect PolicyEffect          — required, no default
//    permissions String[]         — required array, stored as Postgres text[]
//    audience    String[]         — required array, stored as Postgres text[]
//    conditions  Json?            — optional, nullable
//    rolePolicies RolePolicy[]    — explicit join table _role_policies
//    deletedAt soft-delete
// ============================================================

import type {
  Policy,
  Role,
  RolePolicy,
} from "../../generated/prisma/client.js";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type {
  CreatePolicyInput,
  ListPoliciesInput,
  PaginatedResult,
  UpdatePolicyInput,
} from "./types.js";

// ─── Composite types ─────────────────────────────────────────

export type PolicyWithRoles = Policy & {
  rolePolicies: (RolePolicy & { role: Role })[];
};

// Converts a caller-supplied conditions value to what Prisma's
// NullableJsonNullValueInput actually accepts.
// Record<string, unknown> is not directly assignable to InputJsonValue
// because Prisma's InputJsonValue is a recursive concrete union, not an
// index signature. Casting through unknown is the correct bridge.
// null/undefined → Prisma.JsonNull (the sentinel for a DB NULL column).
function toConditions(
  value: Record<string, unknown> | null | undefined, // was: Prisma.InputJsonObject | null | undefined
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (value == null) return Prisma.JsonNull;
  return value as unknown as Prisma.InputJsonValue;
}

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Policy.
// Throws P2002 if [tenantId, name] already exists.
// permissions and audience are stored as Postgres text[] arrays —
// Prisma requires { set: [] } on create for array fields.
const createPolicy = async (input: CreatePolicyInput): Promise<Policy> => {
  return prisma.policy.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      effect: input.effect,
      permissions: { set: input.permissions },
      audience: { set: input.audience },
      // conditions is Json? — Prisma requires the Prisma.JsonNull sentinel
      // to explicitly store null. Passing a plain null is a type error.
      conditions: toConditions(input.conditions),
    },
  });
};

// ─── Read ────────────────────────────────────────────────────

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

// ─── Paginated list ──────────────────────────────────────────

const buildWhere = (
  input: Omit<ListPoliciesInput, "page" | "limit">,
): Prisma.PolicyWhereInput => ({
  deletedAt: null,
  // audience filter uses Postgres array containment: { has: value }
  ...(input.audience !== undefined && {
    audience: { has: input.audience },
  }),
  ...(input.search !== undefined &&
    input.search.length > 0 && {
      OR: [
        { name: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

// Returns a paginated list of all policies.
// audience filter uses Postgres array containment (has).
// Runs findMany + count in parallel — same pattern as listMovements.
const listPolicies = async (
  input: ListPoliciesInput,
): Promise<PaginatedResult<Policy>> => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { name: "asc" },
    }),
    prisma.policy.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// Lists platform-level policies (policies belonging to the platform tenant) — paginated.
// Used only by ADMIN identities.
const listPlatformPolicies = async (
  platformTenantId: string,
  input: { page: number; limit: number },
): Promise<PaginatedResult<Policy>> => {
  const where: Prisma.PolicyWhereInput = {
    tenantId: platformTenantId,
    deletedAt: null,
  };
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { name: "asc" },
    }),
    prisma.policy.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Tenant-scoped paginated list ───────────────────────────

// Returns a paginated list of policies visible to a specific tenant.
// Visibility rule: policy.audience ⊆ tenant.moduleAccess (strict subset).
// Only policies whose entire audience is within the tenant's availed services
// are returned — policies with any out-of-scope service are hidden.
//
// Prisma has no built-in "contained-by" operator for arrays.
// The Postgres <@ operator (array contained-by) is used via $queryRaw.
// Parameters are passed through Prisma.sql to prevent SQL injection.
const listPoliciesForTenant = async (
  moduleAccess: string[],
  input: { page: number; limit: number; search?: string },
): Promise<PaginatedResult<Policy>> => {
  const skip = (input.page - 1) * input.limit;
  const hasSearch = input.search !== undefined && input.search.length > 0;
  const likeParam = hasSearch ? `%${input.search}%` : null;

  // Use Prisma.sql for parameterised queries — moduleAccess is a user-derived
  // value from the DB (tenant.moduleAccess) so it must not be interpolated raw.
  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<Policy[]>(
      Prisma.sql`
    SELECT * FROM policies
    WHERE "deletedAt" IS NULL
      AND audience <@ ARRAY[${Prisma.join(moduleAccess)}]::text[]
      ${hasSearch ? Prisma.sql`AND (name ILIKE ${likeParam} OR description ILIKE ${likeParam})` : Prisma.empty}
    ORDER BY name ASC
    LIMIT ${input.limit} OFFSET ${skip}
  `,
    ),
    prisma.$queryRaw<[{ count: bigint }]>(
      Prisma.sql`
    SELECT COUNT(*) FROM policies
    WHERE "deletedAt" IS NULL
      AND audience <@ ARRAY[${Prisma.join(moduleAccess)}]::text[]
      ${hasSearch ? Prisma.sql`AND (name ILIKE ${likeParam} OR description ILIKE ${likeParam})` : Prisma.empty}
  `,
    ),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  return { data: rows, total, page: input.page, limit: input.limit };
};

// Returns multiple non-deleted policies by their IDs in a single query.
// Used for batch module-scope validation before bulk policy assignment.
const getPoliciesByIds = async (ids: string[]): Promise<Policy[]> => {
  return prisma.policy.findMany({
    where: { id: { in: ids }, deletedAt: null },
  });
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
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.effect !== undefined && { effect: input.effect }),
      // conditions is Json? — must use Prisma.JsonNull to store null,
      // not a plain null literal, to satisfy NullableJsonNullValueInput.
      ...(input.conditions !== undefined && {
        conditions: toConditions(input.conditions),
      }),
      // Array fields must use set: [] — patch semantics not supported
      ...(input.permissions !== undefined && {
        permissions: { set: input.permissions },
      }),
      ...(input.audience !== undefined && {
        audience: { set: input.audience },
      }),
    },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a policy.
// Explicit join rows (RolePolicy) are NOT removed — callers that
// query via rolePolicies include will naturally skip soft-deleted
// policies when they filter by deletedAt: null on the policy side.
const softDeletePolicy = async (id: string): Promise<Policy> => {
  return prisma.policy.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// Restores a soft-deleted policy.
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
  listPoliciesForTenant,
  listPlatformPolicies,
  updatePolicy,
  softDeletePolicy,
  restorePolicy,
};
