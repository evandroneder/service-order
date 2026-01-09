import { Router, Request, Response } from "express";
import { comparePassword } from "../core/crypt";
import { generateTokens, verifyRefreshToken } from "../core/jwt";
import { authSchema, refreshTokenSchema } from "../models/schemas/auth.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { users } from "../mocks/users.mock";
import { Auth, RefreshToken } from "../models/entities/auth.entity";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";

const router = Router();

/**
 * POST /login
 */
router.post("/login", async (req: Request, res: Response) => {
  const validation = validateRequiredFields(req.body, authSchema);

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const { username, password } = req.body as Auth;

  const user = await AuthService.validateUserLogin(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const { accessToken, refreshToken } = generateTokens({
    id_user: user.id_user,
    username: user.username,
    role: user.role,
  });

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id_user: user.id_user,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });
});

/**
 * POST /refresh-token
 */
router.post("/refresh-token", (req, res) => {
  const validation = validateRequiredFields(req.body, refreshTokenSchema);

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const { refreshToken } = req.body as RefreshToken;

  try {
    const payload = verifyRefreshToken(refreshToken);

    const tokens = generateTokens({
      id_user: payload.id_user,
      username: payload.username,
      role: payload.role,
    });

    return res.json(tokens);
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
});

export default router;
