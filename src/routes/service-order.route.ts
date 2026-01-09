import { Router, Request, Response } from "express";
import { validateRequiredFields } from "../models/schemas/schema";
import { serviceOrderSchema } from "../models/schemas/service-order.schema";
import {
  ServiceOrder,
  ItemServiceOrder,
} from "../models/tables/service-order.table";
import { serviceOrders } from "../mocks/service-orders.mock";
import { adminMiddleware } from "../middlewares/adm.middleware";

const router = Router();

let nextServiceOrderId = 1;
let nextItemId = 1;

/**
 * GET /service-order/:id
 */
router.get("/service-order/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const serviceOrder = serviceOrders.find((so) => so.id_service_order === id);

  if (!serviceOrder) {
    return res.status(404).json({ message: "Service order not found" });
  }

  return res.json(serviceOrder);
});

/**
 * GET /service-orders?code=
 */
interface ServiceOrdersQueryParams {
  code?: string;
}
router.get("/service-orders", (req: Request, res: Response) => {
  const { code } = req.query as ServiceOrdersQueryParams;

  let result = serviceOrders;

  if (code) {
    result = result.filter((so) =>
      so.code.toLowerCase().includes(String(code).toLowerCase())
    );
  }

  return res.json(result);
});

/**
 * POST /service-order
 */
router.post("/service-order", (req: Request, res: Response) => {
  const validation = validateRequiredFields<ServiceOrder>(
    req.body,
    serviceOrderSchema
  );

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const { code, description, id_user, id_client, id_company, products } =
    req.body as ServiceOrder;

  const codeIndex = serviceOrders.findIndex((u) => u.code === code);

  if (codeIndex === -1) {
    return res.status(404).json({ message: "Código já existente" });
  }

  const mappedProducts: ItemServiceOrder[] = products.map((item) => ({
    id_item_service_order: nextItemId++,
    quantity: item.quantity,
    description: item.description,
    value: item.value,
    id_service_order: nextServiceOrderId,
  }));

  const newServiceOrder: ServiceOrder = {
    id_service_order: nextServiceOrderId++,
    code,
    description,
    id_user,
    id_client,
    id_company,
    products: mappedProducts,
  };

  serviceOrders.push(newServiceOrder);

  return res.status(201).json(newServiceOrder);
});

/**
 * PATCH /service-order/:id
 */
router.patch("/service-order/:id", (req: Request, res: Response) => {
  const validation = validateRequiredFields<ServiceOrder>(
    req.body,
    serviceOrderSchema
  );

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const id = Number(req.params.id);

  const index = serviceOrders.findIndex((so) => so.id_service_order === id);

  if (index === -1) {
    return res.status(404).json({ message: "Service order not found" });
  }

  const { code, description, id_user, id_client, id_company, products } =
    req.body as Partial<ServiceOrder>;

  serviceOrders[index] = {
    ...serviceOrders[index],
    ...(code !== undefined && { code }),
    ...(description !== undefined && { description }),
    ...(id_user !== undefined && { id_user }),
    ...(id_client !== undefined && { id_client }),
    ...(id_company !== undefined && { id_company }),
    ...(products !== undefined && { products }),
  };

  return res.json(serviceOrders[index]);
});

/**
 * DELETE /service-order/:id
 */
router.delete(
  "/service-order/:id",
  adminMiddleware,
  (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const index = serviceOrders.findIndex((so) => so.id_service_order === id);

    if (index === -1) {
      return res.status(404).json({ message: "Service order not found" });
    }

    serviceOrders.splice(index, 1);

    return res.status(204).send();
  }
);

export default router;
