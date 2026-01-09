import { User } from "../tables/user.table";
import { ValidationSchema } from "./schema";

export const userSchema: ValidationSchema<User> = {
  id_user: { required: false },
  name: { required: true },
  email: { required: true },
  username: { required: true },
  password: { required: true },
  role: { required: true },
};
