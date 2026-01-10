import { Client } from "../models/tables/client.table";
import { query, SqlBuilder } from "../core/query";

export class ClientService {
  static async findClientById(id: number): Promise<Client | null> {
    const clients = await query<Client>(
      `
        SELECT *
        FROM clients
        WHERE id_client = $1
      `,
      [id]
    );

    return clients[0] || null;
  }

  static async findClientByDocument(document: string): Promise<Client | null> {
    const clients = await query<Client>(
      `
        SELECT *
        FROM clients
        WHERE document = $1
      `,
      [document]
    );

    return clients[0] || null;
  }

  static async findAll(params?: Partial<Client>): Promise<Client[]> {
    return query<Client>(
      `
        SELECT *
        FROM clients
        ORDER BY name
      `
    );
  }

  static async create(data: Omit<Client, "id_client">): Promise<Client> {
    const clients = await query<Client>(
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
  static async updateClient(client: Partial<Client>): Promise<Client> {
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

    const result = await query<Client>(sql, params);

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
