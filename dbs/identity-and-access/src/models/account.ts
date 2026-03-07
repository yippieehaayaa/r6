import { encryptPassword, generateHash, verifyPassword } from "@r6/bcrypt";
import {
  type IdentityKind,
  type IdentityStatus,
  type Prisma,
  prisma,
} from "../client.js";
import {
  AccountLockedError,
  EmailExistsError,
  IdentityNotFoundError,
  InvalidCredentialsError,
  InvalidCurrentPasswordError,
  PasswordReuseError,
  UsernameExistsError,
} from "../errors.js";

const FAILED_LOGIN_LIMIT = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export type ChangePasswordInput = {
  id: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type CreateIdentityInput = {
  username: string;
  email?: string;
  password: string;
  kind?: IdentityKind;
  status?: IdentityStatus;
};

export type VerifyIdentityInput = {
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ChangeEmailInput = {
  identityId: string;
  newEmail: string;
  ipAddress?: string;
};

export type UpdateIdentityInput = {
  status?: IdentityStatus;
  kind?: IdentityKind;
  active?: boolean;
};

export type ListIdentitiesInput = {
  page: number;
  limit: number;
  search?: string;
  status?: IdentityStatus;
  kind?: IdentityKind;
  searchField?: "username" | "email";
};

const buildIdentityWhere = (
  input: Pick<
    ListIdentitiesInput,
    "search" | "status" | "kind" | "searchField"
  >,
): Prisma.IdentityWhereInput => ({
  active: true,
  deletedAt: null,
  ...(input.status && { status: input.status }),
  ...(input.kind && { kind: input.kind }),
  ...(input.search && {
    ...(input.searchField === "username" && {
      username: { contains: input.search, mode: "insensitive" },
    }),
    ...(input.searchField === "email" && {
      email: { contains: input.search, mode: "insensitive" },
    }),
    ...(!input.searchField && {
      OR: [
        { username: { contains: input.search, mode: "insensitive" } },
        { email: { contains: input.search, mode: "insensitive" } },
      ],
    }),
  }),
});

const createIdentity = async (input: CreateIdentityInput) => {
  const { salt, hash } = await encryptPassword(input.password);

  try {
    return await prisma.identity.create({
      data: {
        username: input.username,
        email: input.email,
        hash,
        salt,
        kind: input.kind,
        status: input.status,
        changePassword: false,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const meta = (error as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes("email")) throw new EmailExistsError();
      throw new UsernameExistsError();
    }
    throw error;
  }
};

const verifyIdentity = async (input: VerifyIdentityInput) => {
  return await prisma.$transaction(async (tx) => {
    const identity = await tx.identity.findUnique({
      where: { username: input.username, deletedAt: null },
      include: {
        roles: { where: { deletedAt: null }, select: { name: true } },
      },
    });

    if (!identity || !identity.active) {
      throw new InvalidCredentialsError();
    }

    if (identity.lockedUntil && identity.lockedUntil > new Date()) {
      throw new AccountLockedError();
    }

    const valid = await verifyPassword(input.password, identity.hash);

    if (!valid) {
      const newAttempts = identity.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= FAILED_LOGIN_LIMIT;

      await tx.identity.update({
        where: { id: identity.id },
        data: {
          failedLoginAttempts: newAttempts,
          ...(shouldLock && {
            lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
          }),
        },
      });

      throw new InvalidCredentialsError();
    }

    const [updated] = await Promise.all([
      tx.identity.update({
        where: { id: identity.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
        omit: { hash: true, salt: true },
      }),
      ...(input.ipAddress
        ? [
            tx.ipAddress.create({
              data: {
                address: input.ipAddress,
                userAgent: input.userAgent,
                identityId: identity.id,
              },
            }),
          ]
        : []),
    ]);

    return { ...updated, roles: identity.roles };
  });
};

const changePassword = async (input: ChangePasswordInput) => {
  return await prisma.$transaction(async (tx) => {
    const identity = await tx.identity.findUnique({
      where: { id: input.id, deletedAt: null },
      include: { passwordHistories: { orderBy: { changedAt: "desc" } } },
    });

    if (!identity) throw new IdentityNotFoundError();

    const currentValid = await verifyPassword(
      input.currentPassword,
      identity.hash,
    );
    if (!currentValid) throw new InvalidCurrentPasswordError();

    if (input.newPassword !== input.confirmNewPassword) {
      throw new Error("Passwords do not match");
    }

    for (const entry of identity.passwordHistories) {
      const reused = await verifyPassword(input.newPassword, entry.password);
      if (reused) throw new PasswordReuseError();
    }

    const newHash = await generateHash(input.newPassword, identity.salt);

    const [updated] = await Promise.all([
      tx.identity.update({
        where: { id: input.id },
        data: { hash: newHash, changePassword: false },
      }),
      tx.passwordHistory.create({
        data: { password: identity.hash, identityId: identity.id },
      }),
    ]);

    return updated;
  });
};

const changeEmail = async (input: ChangeEmailInput) => {
  return await prisma.$transaction(async (tx) => {
    const identity = await tx.identity.findUnique({
      where: { id: input.identityId, deletedAt: null },
    });

    if (!identity) throw new IdentityNotFoundError();

    const emailTaken = await tx.identity.findUnique({
      where: { email: input.newEmail },
    });
    if (emailTaken) throw new EmailExistsError();

    const [updated] = await Promise.all([
      tx.identity.update({
        where: { id: input.identityId },
        data: { email: input.newEmail },
      }),
      tx.emailHistory.create({
        data: {
          oldEmail: identity.email,
          newEmail: input.newEmail,
          ipAddress: input.ipAddress,
          identityId: identity.id,
        },
      }),
    ]);

    return updated;
  });
};

const getIdentityById = async (id: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id, deletedAt: null },
    omit: { hash: true, salt: true },
    include: {
      roles: { where: { deletedAt: null }, select: { name: true } },
    },
  });

  if (!identity) throw new IdentityNotFoundError();

  return identity;
};

const updateIdentity = async (id: string, input: UpdateIdentityInput) => {
  const identity = await prisma.identity.findUnique({
    where: { id, deletedAt: null },
  });

  if (!identity) throw new IdentityNotFoundError();

  return await prisma.identity.update({
    where: { id },
    data: input,
    omit: { hash: true, salt: true },
  });
};

const deleteIdentity = async (id: string) => {
  const identity = await prisma.identity.findUnique({
    where: { id, deletedAt: null },
  });

  if (!identity) throw new IdentityNotFoundError();

  return await prisma.identity.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
    omit: { hash: true, salt: true },
  });
};

const listIdentities = async (input: ListIdentitiesInput) => {
  const where = buildIdentityWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.identity.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
      omit: { hash: true, salt: true },
    }),
    prisma.identity.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default {
  createIdentity,
  verifyIdentity,
  changePassword,
  changeEmail,
  getIdentityById,
  updateIdentity,
  deleteIdentity,
  listIdentities,
} as const;
