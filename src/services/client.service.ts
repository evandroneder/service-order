import { ClientTable } from "../models/tables/client.table";
import { query, SqlBuilder } from "../core/query";

export class ClientService {
  static async findClientById(id: number): Promise<ClientTable | null> {
    const clients = await query<ClientTable>(
      `
        SELECT *
        FROM clients
        WHERE id_client = $1
      `,
      [id]
    );

    return clients[0] || null;
  }

  static async findClientByDocument(
    document: string
  ): Promise<ClientTable | null> {
    const clients = await query<ClientTable>(
      `
        SELECT *
        FROM clients
        WHERE document = $1
      `,
      [document]
    );

    return clients[0] || null;
  }

  static async findAll(params?: Partial<ClientTable>): Promise<ClientTable[]> {
    const sql = new SqlBuilder();

    sql.whereIf(
      !!params?.name,
      "LOWER(name)",
      "ILIKE",
      `%${params?.name?.toLowerCase()}%`
    );

    sql.whereIf(!!params?.document, "document", "=", params?.document);

    const result = sql.build();

    const SQL = `
    SELECT *
    FROM clients
    ${result.where}
    ORDER BY name
  `;

    return query<ClientTable>(SQL, result.params);
  }

  static async create(
    data: Omit<ClientTable, "id_client">
  ): Promise<ClientTable> {
    const clients = await query<ClientTable>(
      `
        INSERT INTO clients (
          name,
          email,
          phone,
          document,
          cep,
          street,
          number,
          complement
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        data.name,
        data.email,
        data.phone,
        data.document,
        data.cep,
        data.street,
        data.number,
        data.complement ?? null,
      ]
    );

    return clients[0];
  }

  /* ===========================
   * UPDATE (PATCH SAFE)
   * =========================== */
  static async updateClient(
    client: Partial<ClientTable>
  ): Promise<ClientTable> {
    const {
      id_client,
      name,
      email,
      phone,
      document,
      cep,
      street,
      number,
      complement,
    } = client;

    const sqlBuilder = new SqlBuilder();

    sqlBuilder.setIf(!!name, "name", name);
    sqlBuilder.setIf(!!email, "email", email);
    sqlBuilder.setIf(!!phone, "phone", phone);
    sqlBuilder.setIf(!!document, "document", document);
    sqlBuilder.setIf(!!cep, "cep", cep);
    sqlBuilder.setIf(!!street, "street", street);
    sqlBuilder.setIf(!!number, "number", number);
    sqlBuilder.setIf(!!complement, "complement", complement);

    sqlBuilder.where("id_client", "=", id_client);

    sqlBuilder.setReturning(`
      id_client,
      name,
      email,
      phone,
      document,
      cep,
      street,
      number,
      complement
    `);

    const { sql, params } = sqlBuilder.buildUpdate("clients");

    const result = await query<ClientTable>(sql, params);

    return result[0];
  }

  /* ===========================
   * DELETE
   * =========================== */
  static async delete(id: number): Promise<boolean> {
    const result = await query<{ id_client: number }>(
      `
        DELETE FROM clients
        WHERE id_client = $1
        RETURNING id_client
      `,
      [id]
    );

    return result.length > 0;
  }
}
