import { JwtPayload } from "../../core/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      company?: JwtPayload;
    }
  }
}
