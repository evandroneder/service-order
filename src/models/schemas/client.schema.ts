import { Client } from "../tables/client.table";
import { ValidationSchema } from "./schema";

export const clientSchema: ValidationSchema<Client> = {
  id_client: { required: false },
  name: { required: true },
  email: { required: true },
  phone: { required: true },
  document: { required: true },
  cep: { required: true },
  street: { required: true },
  number: { required: true },
  complement: { required: false },
};
