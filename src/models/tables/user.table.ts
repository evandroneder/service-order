import { RolesEnum } from "../enums/role.enum";

export interface UserTable {
  id_user: number;
  name: string;
  email: string;
  username: string;
  password: string;
  role: RolesEnum;
}
