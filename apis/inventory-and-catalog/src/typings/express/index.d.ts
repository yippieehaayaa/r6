import "express";
import type { AuthJwtPayload } from "../../shared/middleware/auth";

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: AuthJwtPayload;
    }
  }
}
