import { Request, Response, Router } from "express";
import { generateTokens, verifyRefreshToken } from "../core/jwt";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Auth } from "../models/entities/auth.entity";
import { authSchema } from "../models/schemas/auth.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { AuthService } from "../services/auth.service";
import { CompanyService } from "../services/company.service";
import { UserService } from "../services/user.service";

const router = Router();

/**
 * POST /login
 */
router.post("/login", async (req: Request, res: Response) => {
  const validation = validateRequiredFields(req.body, authSchema);

  if (validation.missingFields) {
    return res.status(401).json({ message: validation.message });
  }

  const { username, password } = req.body as Auth;

  const user = await AuthService.validateUserLogin(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const companies = await CompanyService.findCompanies();

  const { accessToken, refreshToken } = generateTokens({
    user: {
      id_user: user.id_user,
      name: user.name,
      username: user.username,
      role: user.role,
      email: user.email,
    },
    company: companies[0],
  });

  // 🔐 Cookie seguro com refresh token
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/refresh-token", // importante
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias (ajuste se quiser)
  });

  return res.json({
    accessToken,
  });
});

/**
 * POST /refresh-token
 */
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const { accessToken } = generateTokens({
      user: payload.user,
      company: payload.company,
    });

    // 🔐 Cookie seguro com refresh token
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/refresh-token", // importante
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias (ajuste se quiser)
    });

    return res.json(accessToken);
  } catch {
    return res.status(401).json({ message: "Unauthorized." });
  }
});

/**
 * GET /me
 */
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const user = await UserService.findUserById(req.user.id_user);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.json(user);
});

router.post("/logout", authMiddleware, async (req: Request, res: Response) => {
  res.clearCookie("refresh_token", { path: "/refresh-token" });

  return res.status(200);
});

export default router;
