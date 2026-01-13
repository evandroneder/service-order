import { Request, Response, Router } from "express";
import { generateTokens, verifyRefreshToken } from "../core/jwt";
import { Auth, RefreshToken } from "../models/entities/auth.entity";
import { authSchema, refreshTokenSchema } from "../models/schemas/auth.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";

const router = Router();

/**
 * POST /login
 */
router.post("/login", async (req: Request, res: Response) => {
  const validation = validateRequiredFields(req.body, authSchema);

  if (validation.missingFields) {
    return res.status(400).json({ message: validation.message });
  }

  const { username, password } = req.body as Auth;

  const user = await AuthService.validateUserLogin(username, password);

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials." });
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
    return res.status(400).json({ message: validation.message });
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
    return res.status(400).json({ message: "Unauthorized." });
  }
});

/**
 * GET /me
 */
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const user = await UserService.findUserById(req.user.id_user);

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  return res.json(user);
});

export default router;
