import { query, SqlBuilder } from "../core/query";
import { Company } from "../models/tables/company.table";

export class CompanyService {
  /* =========================
   * FIND BY ID
   * ========================= */
  static async findCompanyById(id_company: number): Promise<Company | null> {
    const companies = await query<Company>(
      `
        SELECT
          *
        FROM companies
        WHERE id_company = $1
      `,
      [id_company]
    );

    return companies[0] || null;
  }

  /* =========================
   * FIND (FILTERS)
   * ========================= */
  static async findCompanies(
    filters?: Partial<Pick<Company, "name" | "document">>
  ): Promise<Company[]> {
    const sqlBuilder = new SqlBuilder();

    sqlBuilder.whereIf(!!filters?.name, "name", "ILIKE", `%${filters?.name}%`);
    sqlBuilder.whereIf(
      !!filters?.document,
      "document",
      "=",
      `${filters?.document}`
    );

    const { where, params } = sqlBuilder.build();

    const sql = `select
      *
    from companies ${where}`;

    return await query<Company>(sql, params);
  }

  /* =========================
   * CREATE
   * ========================= */
  static async createCompany(
    company: Omit<Company, "id_company">
  ): Promise<Company> {
    const {
      name,
      document,
      phone,
      cep,
      street,
      number,
      complement,
      email,
      logo_url,
    } = company;

    const companies = await query<Company>(
      `
        INSERT INTO companies (
          name,
          document,
          phone,
          cep,
          street,
          number,
          complement,
          email,
          logo_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING
          id_company,
          name,
          document,
          phone,
          cep,
          street,
          number,
          complement,
          email,
          logo_url
      `,
      [name, document, phone, cep, street, number, complement, email, logo_url]
    );

    return companies[0];
  }

  /* =========================
   * UPDATE (PADRÃO OFICIAL)
   * ========================= */
  static async updateCompany(company: Partial<Company>): Promise<Company> {
    const {
      id_company,
      name,
      document,
      phone,
      cep,
      street,
      number,
      complement,
      email,
      logo_url,
    } = company;

    const sqlBuilder = new SqlBuilder();

    sqlBuilder.setIf(!!name, "name", name);
    sqlBuilder.setIf(!!document, "document", document);
    sqlBuilder.setIf(!!phone, "phone", phone);
    sqlBuilder.setIf(!!cep, "cep", cep);
    sqlBuilder.setIf(!!street, "street", street);
    sqlBuilder.setIf(!!number, "number", number);
    sqlBuilder.setIf(!!complement, "complement", complement);
    sqlBuilder.setIf(!!email, "email", email);
    sqlBuilder.setIf(!!logo_url, "logo_url", logo_url);

    sqlBuilder.where("id_company", "=", id_company);

    sqlBuilder.setReturning(`
      id_company,
      name,
      document,
      phone,
      cep,
      street,
      number,
      complement,
      email,
      logo_url
    `);

    const { sql, params } = sqlBuilder.buildUpdate("companies");

    const result = await query<Company>(sql, params);

    return result[0];
  }

  /* =========================
   * DELETE
   * ========================= */
  static async deleteCompany(id_company: number): Promise<void> {
    await query(
      `
        DELETE FROM companies
        WHERE id_company = $1
      `,
      [id_company]
    );
  }
}
