import { QueryResultRow } from "pg";
import pool from "./database";

export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export class SqlBuilder {
  private returning: string = "";
  private sets: string[] = [];
  private conditions: string[] = [];
  private params: any[] = [];

  where(condition: string, operator: "ILIKE" | "=", value: any) {
    this.params.push(value);
    this.conditions.push(`${condition} ${operator} $${this.params.length}`);
  }

  whereIf(
    predicate: boolean | undefined,
    condition: string,
    operator: "ILIKE" | "=",
    value: any
  ) {
    if (!predicate) return;
    this.where(condition, operator, value);
  }

  build() {
    return {
      where:
        this.conditions.length > 0
          ? "WHERE " + this.conditions.join(" AND ")
          : "",
      params: this.params,
    };
  }

  set(field: string, value: any) {
    this.params.push(value);
    this.sets.push(`${field} = $${this.params.length}`);
  }

  setIf(predicate: boolean | undefined, field: string, value: any) {
    if (!predicate) return;
    this.set(field, value);
  }

  setReturning(returning: string) {
    this.returning = returning;
  }

  buildUpdate(table: string) {
    return {
      sql: `
        UPDATE ${table}
        SET ${this.sets.join(", ")}
        WHERE ${this.conditions.join(" AND ")}
        ${this.returning ? "RETURNING " + this.returning : ""}
      `,
      params: this.params,
    };
  }
}
