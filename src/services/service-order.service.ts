import pool from "../core/database";
import { query, SqlBuilder } from "../core/query";
import {
  ItemServiceOrder,
  ServiceOrder,
} from "../models/tables/service-order.table";
import { ServiceOrderListView } from "../models/views/service-order.view";

export class ServiceOrderService {
  static async findAll(
    filters?: Partial<ServiceOrder>
  ): Promise<ServiceOrderListView[]> {
    const orders = await query<ServiceOrderListView>(`
    SELECT
      so.id_service_order,
      so.description,
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
  static async findOrderById(id: number): Promise<ServiceOrder | null> {
    const orders = await query<ServiceOrder>(
      "SELECT * FROM service_orders WHERE id_service_order = $1",
      [id]
    );

    const products = await query<ItemServiceOrder>(
      `SELECT * FROM item_service_orders where id_service_order = $1`,
      [id]
    );

    const serviceOrder = {
      ...orders[0],
      products,
    } as ServiceOrder;

    return serviceOrder || null;
  }

  static async create(
    data: Omit<ServiceOrder, "id_service_order" | "code">
  ): Promise<ServiceOrder> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* ===============================
         INSERT SERVICE ORDER
      =============================== */
      const serviceOrderResult = await client.query<ServiceOrder>(
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

      const createdOrder = serviceOrderResult.rows[0];

      /* ===============================
         INSERT ITEMS
      =============================== */
      for (const item of data.products) {
        const createdOrderItem = await client.query<ItemServiceOrder>(
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
            createdOrder.id_service_order,
            item.quantity,
            item.description,
            item.value,
          ]
        );

        if (!createdOrder.products) {
          createdOrder.products = [createdOrderItem.rows[0]];
          continue;
        }

        createdOrder.products.push(createdOrderItem.rows[0]);
      }

      await client.query("COMMIT");

      return createdOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(
    data: Partial<ServiceOrder>
  ): Promise<ServiceOrder | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* ===============================
         INSERT SERVICE ORDER
      =============================== */

      const sqlBuilder = new SqlBuilder();

      sqlBuilder.setIf(!!data.description, "description", data.description);

      sqlBuilder.where("id_service_order", "=", data.id_service_order);

      sqlBuilder.setReturning(`
            *
          `);

      const { sql, params } = sqlBuilder.buildUpdate("service_orders");

      const result = await client.query(sql, params);

      const updatedOrder = result.rows[0];

      /* ===============================
         INSERT ITEMS
      =============================== */

      await client.query(
        `DELETE FROM item_service_orders WHERE id_service_order = $1`,
        [data.id_service_order]
      );

      for (const item of data.products ?? []) {
        const createdOrderItem = await client.query<ItemServiceOrder>(
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

        if (!updatedOrder.products) {
          updatedOrder.products = [createdOrderItem.rows[0]];
          continue;
        }

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
