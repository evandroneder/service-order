import pool from "../core/database";
import { query, SqlBuilder } from "../core/query";
import {
  ItemServiceOrderTable,
  ServiceOrderTable,
} from "../models/tables/service-order.table";
import {
  ServiceOrderListView,
  ServiceOrderView,
} from "../models/views/service-order.view";

export class ServiceOrderService {
  static async findAll(
    filters?: Partial<ServiceOrderTable>
  ): Promise<ServiceOrderListView[]> {
    const orders = await query<ServiceOrderListView>(`
    SELECT
      so.id_service_order,
      so.description,
      so.created_at,
      c.name AS company_name,
      cl.name AS client_name,
      SUM(i.quantity * i.value) AS total
    FROM service_orders so
    INNER JOIN companies c ON c.id_company = so.id_company
    INNER JOIN clients cl ON cl.id_client = so.id_client
    INNER JOIN item_service_orders i ON i.id_service_order = so.id_service_order
    GROUP BY
      so.id_service_order,
      so.description,
      c.name,
      cl.name
    ORDER BY so.id_service_order DESC
  `);

    return orders;
  }
  static async findOrderById(id: number): Promise<ServiceOrderTable | null> {
    const orders = await query<ServiceOrderTable>(
      "SELECT * FROM service_orders WHERE id_service_order = $1",
      [id]
    );

    const products = await query<ItemServiceOrderTable>(
      `SELECT * FROM item_service_orders where id_service_order = $1`,
      [id]
    );

    const serviceOrder = {
      ...orders[0],
      products,
    } as ServiceOrderTable;

    return serviceOrder || null;
  }

  static async create(
    data: Omit<ServiceOrderView, "id_service_order" | "created_at">
  ): Promise<ServiceOrderView> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* ===============================
         INSERT SERVICE ORDER
      =============================== */
      const serviceOrderResult = await client.query<ServiceOrderTable>(
        `
          INSERT INTO service_orders (
            description,
            id_client,
            id_company,
            id_user
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `,
        [data.description, data.id_client, data.id_company, data.id_user]
      );

      const viewOrder: ServiceOrderView = {
        ...serviceOrderResult.rows[0],
        products: [],
      };

      /* ===============================
         INSERT ITEMS
      =============================== */
      for (const item of data.products) {
        const createdOrderItem = await client.query<ItemServiceOrderTable>(
          `
            INSERT INTO item_service_orders (
              id_service_order,
              quantity,
              description,
              value
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `,
          [
            viewOrder.id_service_order,
            item.quantity,
            item.description,
            item.value,
          ]
        );

        viewOrder.products.push(createdOrderItem.rows[0]);
      }

      await client.query("COMMIT");

      return viewOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(
    data: Partial<ServiceOrderView>
  ): Promise<ServiceOrderView | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* ===============================
         UPDATE SERVICE ORDER
      =============================== */

      const sqlBuilder = new SqlBuilder();

      sqlBuilder.setIf(!!data.description, "description", data.description);

      sqlBuilder.where("id_service_order", "=", data.id_service_order);

      sqlBuilder.setReturning(`
            *
          `);

      const { sql, params } = sqlBuilder.buildUpdate("service_orders");

      const result = await client.query<ServiceOrderTable>(sql, params);

      const updatedOrder: ServiceOrderView = {
        ...result.rows[0],
        products: [],
      };

      /* ===============================
         REMOVER AND INSERT ITEMS
      =============================== */

      await client.query(
        `DELETE FROM item_service_orders WHERE id_service_order = $1`,
        [data.id_service_order]
      );

      for (const item of data.products ?? []) {
        const createdOrderItem = await client.query<ItemServiceOrderTable>(
          `
            INSERT INTO item_service_orders (
              id_service_order,
              quantity,
              description,
              value
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `,
          [
            updatedOrder.id_service_order,
            item.quantity,
            item.description,
            item.value,
          ]
        );

        updatedOrder.products.push(createdOrderItem.rows[0]);
      }

      await client.query("COMMIT");

      return updatedOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
