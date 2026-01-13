import { ServiceOrder } from "../tables/service-order.table";
import { ValidationSchema } from "./schema";

export const serviceOrderSchema: ValidationSchema<ServiceOrder> = {
  id_service_order: { required: false },

  code: { required: false },
  description: { required: true },

  id_user: { required: false },
  id_client: { required: true },
  id_company: { required: true },

  products: { required: true, type: "array" },
};

export const serviceOrderUpdateSchema: ValidationSchema<ServiceOrder> = {
  id_service_order: { required: false },

  code: { required: false },
  description: { required: true },

  id_user: { required: false },
  id_client: { required: false },
  id_company: { required: false },

  products: { required: true, type: "array" },
};
