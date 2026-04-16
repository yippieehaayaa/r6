import { expireReservations } from "@r6/db-inventory";
import type { NextFunction, Request, Response } from "express";

export async function expireReservationsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await expireReservations();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
