import { Auth } from "../entities/auth.entity";
import { ValidationSchema } from "./schema";

export const authSchema: ValidationSchema<Auth> = {
  username: { required: true },
  password: { required: true },
};
