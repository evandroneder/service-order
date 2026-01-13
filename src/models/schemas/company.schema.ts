import { Company } from "../tables/company.table";
import { ValidationSchema } from "./schema";

export const companySchema: ValidationSchema<Company> = {
  id_company: { required: false },

  name: { required: true },
  document: { required: true },
  phone: { required: true },

  cep: { required: true },
  street: { required: true },
  number: { required: true },

  email: { required: true },

  complement: { required: false },
  logo_url: { required: false },
};
