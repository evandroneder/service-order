import { hashPassword } from "../core/crypt";
import { query, SqlBuilder } from "../core/query";
import { UserTable } from "../models/tables/user.table";

export class UserService {
  static async findUserById(id: number): Promise<UserTable | null> {
    const users = await query<UserTable>(
      "SELECT id_user, name, email, username FROM users WHERE id_user = $1",
      [id]
    );

    return users[0] || null;
  }

  static async findAll(user?: Partial<UserTable>): Promise<UserTable[] | null> {
    const sqlBuilder = new SqlBuilder();

    sqlBuilder.whereIf(!!user?.name, "name", "ILIKE", `%${user?.name}%`);

    sqlBuilder.whereIf(!!user?.username, "username", "=", user?.username);

    const { where, params } = sqlBuilder.build();

    const querySQL = `
    SELECT id_user, name, username, role, email
    FROM users
    ${where}
    ORDER BY name
  `;

    const users = await query<UserTable>(querySQL, params);

    return users.length ? users : null;
  }

  static async createUser(user: Partial<UserTable>): Promise<UserTable> {
    const { name, email, username, password, role } = user;

    const result = await query<UserTable>(
      `
    INSERT INTO users (name, email, username, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_user, name, email, username, role
    `,
      [name, email, username, await hashPassword(password!), role]
    );
    return result[0];
  }

  static async updateUser(user: Partial<UserTable>): Promise<UserTable> {
    const { name, email, username, password, role, id_user } = user;

    const sqlBuilder = new SqlBuilder();

    sqlBuilder.setIf(!!name, "name", name);
    sqlBuilder.setIf(!!username, "username", username);
    sqlBuilder.setIf(!!password, "password", await hashPassword(password!));
    sqlBuilder.setIf(!!email, "email", email);
    sqlBuilder.setIf(!!role, "role", role);

    sqlBuilder.where("id_user", "=", id_user);

    sqlBuilder.setReturning("id_user, name, username, email, role");

    const { sql, params } = sqlBuilder.buildUpdate("users");

    const result = await query<UserTable>(sql, params);

    return result[0];
  }

  static async deleteUser(id: number): Promise<void> {
    const sqlBuilder = new SqlBuilder();
    sqlBuilder.where("id_user", "=", id);
    const { where, params } = sqlBuilder.build();

    await query<UserTable>(`DELETE FROM USERS ${where}`, params);
  }
}
