import type { AuthJwtPayload } from "../../middleware/auth";

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: AuthJwtPayload;
    }
  }
}
