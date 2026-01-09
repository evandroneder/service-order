import { Router, Request, Response } from "express";
import { companySchema } from "../models/schemas/company.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { Company } from "../models/tables/company.table";
import { companies } from "../mocks/companies.mock";
import { adminMiddleware } from "../middlewares/adm.middleware";

const router = Router();

let nextId = 1;

/**
 * GET /company/:id
 */
router.get("/company/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const company = companies.find((c) => c.id_company === id);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  return res.json(company);
});

/**
 * GET /companies?name=&document=
 */
interface CompaniesQueryParams {
  name?: string;
  document?: string;
}
router.get("/companies", (req: Request, res: Response) => {
  const { name, document } = req.query as CompaniesQueryParams;

  let result = companies;

  if (name) {
    result = result.filter((c) =>
      c.name.toLowerCase().includes(String(name).toLowerCase())
    );
  }

  if (document) {
    result = result.filter((c) => c.document.includes(String(document)));
  }

  return res.json(result);
});

/**
 * POST /company
 */
router.post("/company", (req: Request, res: Response) => {
  const validation = validateRequiredFields<Company>(req.body, companySchema);

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const {
    name,
    document,
    phone,
    cep,
    street,
    number,
    complement,
    email,
    logo,
  } = req.body as Company;

  const documentIndex = companies.findIndex((u) => u.document === document);

  if (documentIndex === -1) {
    return res
      .status(404)
      .json({ message: "Empresa já cadastrada com esse documento." });
  }

  const newCompany: Company = {
    id_company: nextId++,
    name,
    document,
    phone,
    cep,
    street,
    number,
    complement,
    email,
    logo,
  };

  companies.push(newCompany);

  return res.status(201).json(newCompany);
});

/**
 * PATCH /company/:id
 */
router.patch("/company/:id", (req: Request, res: Response) => {
  const validation = validateRequiredFields<Company>(req.body, companySchema);

  if (validation.missingFields) {
    return res.status(400).json(validation.message);
  }

  const id = Number(req.params.id);

  const index = companies.findIndex((c) => c.id_company === id);

  if (index === -1) {
    return res.status(404).json({ message: "Company not found" });
  }

  const {
    name,
    document,
    phone,
    cep,
    street,
    number,
    complement,
    email,
    logo,
  } = req.body as Partial<Company>;

  companies[index] = {
    ...companies[index],
    ...(name !== undefined && { name }),
    ...(document !== undefined && { document }),
    ...(phone !== undefined && { phone }),
    ...(cep !== undefined && { cep }),
    ...(street !== undefined && { street }),
    ...(number !== undefined && { number }),
    ...(complement !== undefined && { complement }),
    ...(email !== undefined && { email }),
    ...(logo !== undefined && { logo }),
  };

  return res.json(companies[index]);
});

/**
 * DELETE /company/:id
 */
router.delete(
  "/company/:id",
  adminMiddleware,
  (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const index = companies.findIndex((c) => c.id_company === id);

    if (index === -1) {
      return res.status(404).json({ message: "Company not found" });
    }

    companies.splice(index, 1);

    return res.status(204).send();
  }
);

export default router;
