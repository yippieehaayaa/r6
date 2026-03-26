import {
  createIdentity,
  getIdentityById,
  updateIdentity,
} from "@r6/db-identity-and-access";
import { CreateIdentitySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { toSafeIdentity } from "../helpers";

export async function createIdentityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const body = CreateIdentitySchema.parse(req.body);

    const identity = await createIdentity({
      tenantId,
      username: body.username,
      email: body.email ?? null,
      password: body.plainPassword,
      kind: body.kind ?? "USER",
      mustChangePassword: body.mustChangePassword ?? false,
    });

    await updateIdentity(identity.id, { status: "ACTIVE" });
    const fresh = await getIdentityById(identity.id);
    if (!fresh)
      throw new AppError(
        500,
        "internal",
        "Failed to retrieve created identity",
      );

    res.status(201).json(toSafeIdentity(fresh));
  } catch (error) {
    next(error);
  }
}
