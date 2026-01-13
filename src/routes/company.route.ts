import { Router, Request, Response } from "express";
import { companySchema } from "../models/schemas/company.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { Company } from "../models/tables/company.table";
import { companies } from "../mocks/companies.mock";
import { adminMiddleware } from "../middlewares/adm.middleware";
import { CompanyService } from "../services/company.service";

const router = Router();

/**
 * GET /company/:id
 */
router.get("/company/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const company = await CompanyService.findCompanyById(id);

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
router.get("/companies", async (req: Request, res: Response) => {
  const { name, document } = req.query as CompaniesQueryParams;

  const companies = await CompanyService.findCompanies({ name, document });

  return res.json(companies);
});

/**
 * POST /company
 */
router.post("/company", async (req: Request, res: Response) => {
  const validation = validateRequiredFields<Company>(req.body, companySchema);

  if (validation.missingFields) {
    return res.status(400).json({ message: validation.message });
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
    logo_url,
  } = req.body as Company;

  const companies = await CompanyService.findCompanies({ document });

  if (companies.length > 0) {
    return res.status(404).json({ message: "Empresa já cadastrada." });
  }

  const newCompany: Omit<Company, "id_company"> = {
    name,
    document,
    phone,
    cep,
    street,
    number,
    complement,
    email,
    logo_url,
  };

  const company = await CompanyService.createCompany(newCompany);

  return res.status(201).json(company);
});

/**
 * PATCH /company/:id
 */
router.patch("/company/:id", (req: Request, res: Response) => {
  const validation = validateRequiredFields<Company>(req.body, companySchema);

  if (validation.missingFields) {
    return res.status(400).json({ message: validation.message });
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
    logo_url,
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
    ...(logo_url !== undefined && { logo_url }),
  };

  return res.json(companies[index]);
});

/**
 * DELETE /company/:id
 */
router.delete(
  "/company/:id",
  adminMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    await CompanyService.deleteCompany(id);
    return res.status(204).send();
  }
);

export default router;
