import { changePassword } from "@r6/db-identity-and-access";
import { ChangePasswordSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const payload = ChangePasswordSchema.parse(req.body);

    await changePassword(req.jwtPayload.sub, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}
