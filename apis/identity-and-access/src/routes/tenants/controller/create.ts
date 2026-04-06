import { encryptPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import { createTenantWithDefaults } from "@r6/db-identity-and-access";
import { CreateTenantSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { generatePassword } from "../helpers";

export async function createTenantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = CreateTenantSchema.parse(req.body);

    // Pre-compute hash outside the DB transaction (bcrypt is async)
    const ownerPassword = generatePassword();
    const { hash, salt } = await encryptPassword(hmac(ownerPassword));

    const { tenant, ownerUsername } = await createTenantWithDefaults(
      body,
      hash,
      salt,
    );

    res.status(201).json({
      ...tenant,
      ownerCredentials: {
        username: ownerUsername,
        password: ownerPassword,
      },
    });
  } catch (error) {
    next(error);
  }
}
