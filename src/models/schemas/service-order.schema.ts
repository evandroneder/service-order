import { ServiceOrderView } from "../views/service-order.view";
import { ValidationSchema } from "./schema";

export const serviceOrderCreateSchema: ValidationSchema<
  Pick<ServiceOrderView, "id_client" | "products" | "description">
> = {
  description: { required: true },
  id_client: { required: true },
  products: { required: true, type: "array" },
};

export const serviceOrderUpdateSchema: ValidationSchema<
  Pick<ServiceOrderView, "description" | "products">
> = {
  description: { required: true },
  products: { required: true, type: "array" },
};
