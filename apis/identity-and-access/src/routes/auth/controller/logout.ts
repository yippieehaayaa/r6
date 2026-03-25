import type { NextFunction, Request, Response } from "express";

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}
