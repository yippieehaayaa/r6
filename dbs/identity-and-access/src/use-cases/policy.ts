// ============================================================
//  policy.ts
//  Use cases for the Policy model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, name])   — policy names unique per tenant
//    @@index([tenantId])
//    @@index([deletedAt])
//    tenantId nullable            — null for platform-level policies
//    effect PolicyEffect          — required, no default
//    permissions String[]         — required array, stored as Postgres text[]
//    audience    String[]         — required array, stored as Postgres text[]
//    conditions  Json?            — optional, nullable
//    roles Role[]                 — many-to-many implicit join
//    deletedAt soft-delete
// ============================================================

import type { Policy, Role } from "../../generated/prisma/client.js";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type {
	CreatePolicyInput,
	ListPoliciesInput,
	PaginatedResult,
	UpdatePolicyInput,
} from "./types.js";

// Converts a caller-supplied conditions value to what Prisma's
// NullableJsonNullValueInput actually accepts.
// Record<string, unknown> is not directly assignable to InputJsonValue
// because Prisma's InputJsonValue is a recursive concrete union, not an
// index signature. Casting through unknown is the correct bridge.
// null/undefined → Prisma.JsonNull (the sentinel for a DB NULL column).
function toConditions(
  value: Record<string, unknown> | null | undefined,  // was: Prisma.InputJsonObject | null | undefined
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
}

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted policy by primary key.
const getPolicyById = async (id: string): Promise<Policy | null> => {
	return prisma.policy.findFirst({
		where: { id, deletedAt: null },
	});
}

// Finds a non-deleted policy by [tenantId, name].
// Uses @@unique([tenantId, name]).
const getPolicyByName = async (
	tenantId: string | null,
	name: string,
): Promise<Policy | null> => {
	return prisma.policy.findFirst({
		where: { tenantId, name, deletedAt: null },
	});
}

// Returns a policy with its attached roles included.
const getPolicyWithRoles = async (
	id: string,
): Promise<(Policy & { roles: Role[] }) | null> => {
	return prisma.policy.findFirst({
		where: { id, deletedAt: null },
		include: { roles: true },
	});
}

// ─── Paginated list ──────────────────────────────────────────

const buildWhere = (
	input: Omit<ListPoliciesInput, "page" | "limit">,
): Prisma.PolicyWhereInput => ({
	tenantId: input.tenantId,
	deletedAt: null,
	// audience filter uses Postgres array containment: { has: value }
	...(input.audience !== undefined && {
		audience: { has: input.audience },
	}),
});

// Returns a paginated list of policies for a tenant.
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
}

// Lists platform-level policies (tenantId = null) — paginated.
// Used only by ADMIN identities.
const listPlatformPolicies = async (input: {
	page: number;
	limit: number;
}): Promise<PaginatedResult<Policy>> => {
	const where: Prisma.PolicyWhereInput = { tenantId: null, deletedAt: null };
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
}

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
}

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a policy.
// Implicit join rows (policy ↔ role) are NOT removed —
// Prisma's implicit many-to-many does not cascade soft-deletes.
// Roles that reference this policy will stop seeing it in queries
// filtered by deletedAt: null.
const softDeletePolicy = async (id: string): Promise<Policy> => {
	return prisma.policy.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}

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
	listPolicies,
	listPlatformPolicies,
	updatePolicy,
	softDeletePolicy,
	restorePolicy,
};
