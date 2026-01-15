import { comparePassword } from "../core/crypt";
import { query } from "../core/query";
import { UserTable } from "../models/tables/user.table";

export class AuthService {
  static async validateUserLogin(
    username: string,
    password: string
  ): Promise<UserTable | null> {
    const result = await query<UserTable & { password: string }>(
      `
    SELECT id_user, name, email, username, password, role
    FROM users
    WHERE username = $1
    `,
      [username]
    );

    if (!result.length) {
      return null;
    }

    const user = result[0];

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    const { password: _, ...safeUser } = user;

    return safeUser as UserTable;
  }
}
