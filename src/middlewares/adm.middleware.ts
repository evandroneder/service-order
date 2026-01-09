import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../core/jwt";
import { RolesEnum } from "../models/enums/role.enum";
import { TokenExpiredError } from "jsonwebtoken";
import { AuthCodeEnum } from "../models/enums/auth-code.enum";

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.role !== RolesEnum.ADMIN) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    req.user = decoded;
    return next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return res.status(401).json({
        code: AuthCodeEnum.TOKEN_EXPIRED,
        message: "Access token expired",
      });
    }

    return res.status(401).json({ message: "Unauthorized." });
  }
}
