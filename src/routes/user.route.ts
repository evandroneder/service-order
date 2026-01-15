import { Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequiredFields } from "../models/schemas/schema";
import { userSchema } from "../models/schemas/user.schema";
import { UserTable } from "../models/tables/user.table";
import { UserService } from "../services/user.service";

const router = Router();

/**
 * GET /user/:id
 */
router.get("/user/:id", authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await UserService.findUserById(id);
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  return res.status(200).json(user);
});

/**
 * GET /users?document=&name=
 */
interface UserQueryParams {
  name?: string;
}
router.get("/users", authMiddleware, async (req: Request, res: Response) => {
  const { name } = req.query as UserQueryParams;

  const users = await UserService.findAll({ name });

  return res.status(200).json(users);
});

/**
 * POST /user
 */
router.post("/user", authMiddleware, async (req: Request, res: Response) => {
  const validation = validateRequiredFields<UserTable>(req.body, userSchema);

  if (validation.missingFields) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const { name, username, password, role, email } = req.body as UserTable;

  const users = await UserService.findAll({ username });

  if (users && users.length > 0) {
    return res.status(409).json({ message: "Usuário já existe" });
  }

  const newUser: Partial<UserTable> = {
    name,
    username,
    password,
    role,
    email,
  };

  const created = await UserService.createUser(newUser);

  return res.status(201).json(created);
});

/**
 * PATCH /user/:id
 */
router.patch(
  "/user/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation = validateRequiredFields<UserTable>(req.body, userSchema);

    if (validation.missingFields) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    const id = Number(req.params.id);
    const { name, username, password, role, email } = req.body as UserTable;

    const user = await UserService.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const updateUser: Partial<UserTable> = {
      id_user: id,
      name,
      username,
      password,
      role,
      email,
    };

    const updated = await UserService.updateUser(updateUser);

    return res.status(200).json(updated);
  }
);

/**
 * DELETE /user/:id
 */
router.delete(
  "/user/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    await UserService.deleteUser(id);

    return res.status(204).send();
  }
);

export default router;
