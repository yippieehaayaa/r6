import { encryptPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import { createTenantWithDefaults } from "@r6/db-identity-and-access";
import { RegisterSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import {
  TENANT_ADMIN_DEFAULT_POLICIES,
  TENANT_OWNER_DEFAULT_POLICIES,
} from "../../../lib/constants";
import { toSafeIdentity } from "../../identities/helpers";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = RegisterSchema.parse(req.body);

    // Pre-compute hash outside the DB transaction (bcrypt is async and cannot
    // run safely inside a Prisma interactive transaction callback).
    const { hash, salt } = await encryptPassword(hmac(body.plainPassword));

    const { tenant, ownerIdentity } = await createTenantWithDefaults(
      { name: body.companyName, slug: body.slug, moduleAccess: [] },
      hash,
      salt,
      body.email,
      TENANT_OWNER_DEFAULT_POLICIES,
      TENANT_ADMIN_DEFAULT_POLICIES,
    );

    res.status(201).json({
      tenant,
      owner: toSafeIdentity(ownerIdentity),
    });
  } catch (error) {
    next(error);
  }
}
