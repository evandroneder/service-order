import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../core/jwt";
import { TokenExpiredError } from "jsonwebtoken";
import { AuthCodeEnum } from "../models/enums/auth-code.enum";

export function authMiddleware(
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

    req.user = decoded.user;
    req.company = decoded.company;
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
