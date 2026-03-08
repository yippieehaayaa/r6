import { type PolicyEffect, type Prisma, prisma } from "../client.js";
import {
  IdentityNotFoundError,
  PolicyNameExistsError,
  PolicyNotFoundError,
} from "../errors.js";

export type CreatePolicyInput = {
  name: string;
  description?: string;
  effect: PolicyEffect;
  permissions: string[];
  audience: string[];
  conditions?: Prisma.InputJsonValue;
};

export type UpdatePolicyInput = {
  name?: string;
  description?: string;
  effect?: PolicyEffect;
  permissions?: string[];
  audience?: string[];
  conditions?: Prisma.InputJsonValue;
};

export type ListPoliciesInput = {
  page: number;
  limit: number;
  search?: string;
  effect?: PolicyEffect;
};

export type EvaluateAccessInput = {
  identityId: string;
  permission: string;
  audience: string;
};

const buildPolicyWhere = (
  input: Pick<ListPoliciesInput, "search" | "effect">,
): Prisma.PolicyWhereInput => ({
  deletedAt: null,
  ...(input.effect && { effect: input.effect }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const createPolicy = async (input: CreatePolicyInput) => {
  try {
    return await prisma.policy.create({
      data: {
        name: input.name,
        description: input.description,
        effect: input.effect,
        permissions: input.permissions,
        audience: input.audience,
        conditions: input.conditions,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new PolicyNameExistsError();
    }
    throw error;
  }
};

const getPolicyById = async (id: string) => {
  const policy = await prisma.policy.findUnique({
    where: { id, deletedAt: null },
  });

  if (!policy) throw new PolicyNotFoundError();

  return policy;
};

const updatePolicy = async (id: string, input: UpdatePolicyInput) => {
  const policy = await prisma.policy.findUnique({
    where: { id, deletedAt: null },
  });

  if (!policy) throw new PolicyNotFoundError();

  try {
    return await prisma.policy.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new PolicyNameExistsError();
    }
    throw error;
  }
};

const deletePolicy = async (id: string) => {
  const policy = await prisma.policy.findUnique({
    where: { id, deletedAt: null },
  });

  if (!policy) throw new PolicyNotFoundError();

  return await prisma.policy.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const listPolicies = async (input: ListPoliciesInput) => {
  const where = buildPolicyWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.policy.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

/**
 * Checks whether a granted permission string (which may contain `*` wildcards
 * in any segment) satisfies the required `{service}:{resource}:{action}` string.
 *
 * Example: matchesPermission("iam:otp:write", "iam:*:*") → true
 */
const matchesPermission = (required: string, granted: string): boolean => {
  const r = required.split(":");
  const g = granted.split(":");
  if (r.length !== 3 || g.length !== 3) return false;
  return g.every((seg, i) => seg === "*" || seg === r[i]);
};

const evaluateAccess = async (input: EvaluateAccessInput) => {
  const identity = await prisma.identity.findUnique({
    where: { id: input.identityId, deletedAt: null },
    include: {
      roles: {
        where: { deletedAt: null },
        include: { policies: { where: { deletedAt: null } } },
      },
    },
  });

  if (!identity) throw new IdentityNotFoundError();

  const allPolicies = identity.roles.flatMap((r) => r.policies);

  const seen = new Set<string>();
  const uniquePolicies = allPolicies.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const matching = uniquePolicies.filter(
    (p) =>
      p.audience.includes(input.audience) &&
      p.permissions.some((granted) =>
        matchesPermission(input.permission, granted),
      ),
  );

  if (matching.some((p) => p.effect === "DENY")) return false;
  return matching.some((p) => p.effect === "ALLOW");
};

export default {
  createPolicy,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  listPolicies,
  evaluateAccess,
} as const;
