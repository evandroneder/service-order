import { ServiceOrderView } from "../views/service-order.view";
import { ValidationSchema } from "./schema";

export const serviceOrderSchema: ValidationSchema<ServiceOrderView> = {
  id_service_order: { required: false },

  description: { required: true },

  id_user: { required: false },
  id_client: { required: true },
  id_company: { required: true },

  products: { required: true, type: "array" },
};

export const serviceOrderUpdateSchema: ValidationSchema<
  Pick<ServiceOrderView, "description" | "products">
> = {
  description: { required: true },
  products: { required: true, type: "array" },
};
