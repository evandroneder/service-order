import { Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { serviceOrders } from "../mocks/service-orders.mock";
import { validateRequiredFields } from "../models/schemas/schema";
import {
  serviceOrderCreateSchema,
  serviceOrderUpdateSchema,
} from "../models/schemas/service-order.schema";
import { ServiceOrderView } from "../models/views/service-order.view";
import { ClientService } from "../services/client.service";
import { CompanyService } from "../services/company.service";
import { ServiceOrderService } from "../services/service-order.service";

const router = Router();

/**
 * GET /service-order/:id
 */
router.get(
  "/service-order/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const serviceOrder = await ServiceOrderService.findOrderById(id);

    if (!serviceOrder) {
      return res.status(404).json({ message: "Service order not found" });
    }

    const company = await CompanyService.findCompanyById(
      serviceOrder.id_company
    );

    const client = await ClientService.findClientById(serviceOrder.id_client);

    return res.json({
      ...serviceOrder,
      company,
      client,
    });
  }
);

/**
 * GET /service-orders?code=
 */

router.get(
  "/service-orders",
  authMiddleware,
  async (req: Request, res: Response) => {
    const orders = await ServiceOrderService.findAll();

    return res.json(orders);
  }
);

/**
 * POST /service-order
 */
router.post(
  "/service-order",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation = validateRequiredFields(
      req.body,
      serviceOrderCreateSchema
    );

    if (validation.missingFields) {
      return res.status(400).json({ message: validation.message });
    }

    const { description, id_client, id_company, products } =
      req.body as ServiceOrderView;

    const created = await ServiceOrderService.create({
      description,
      id_client,
      products,
      id_user: req.user?.id_user,
      id_company: req.company?.id_company,
    });

    return res.status(201).json(created);
  }
);

/**
 * PATCH /service-order/:id
 */
router.patch(
  "/service-order/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const validation = validateRequiredFields(
      req.body,
      serviceOrderUpdateSchema
    );

    if (validation.missingFields) {
      return res.status(400).json({ message: validation.message });
    }

    const id = Number(req.params.id);

    const serviceOrder = await ServiceOrderService.findOrderById(id);

    if (!serviceOrder) {
      return res.status(404).json({ message: "Service order not found" });
    }

    const { description, products } = req.body as Pick<
      ServiceOrderView,
      "description" | "products"
    >;

    const updated = await ServiceOrderService.update({
      id_service_order: id,
      description,
      products,
    });

    return res.json(updated);
  }
);

/**
 * DELETE /service-order/:id
 */
router.delete(
  "/service-order/:id",
  authMiddleware,
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
