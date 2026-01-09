import { ServiceOrder } from "../tables/service-order.table";
import { ValidationSchema } from "./schema";

export const serviceOrderSchema: ValidationSchema<ServiceOrder> = {
  id_service_order: { required: false },

  code: { required: true },
  description: { required: true },

  id_user: { required: true },
  id_client: { required: true },
  id_company: { required: true },

  products: { required: true },
};
