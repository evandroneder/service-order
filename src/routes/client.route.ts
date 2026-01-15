import { Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { clients } from "../mocks/clients.mock";
import { clientSchema } from "../models/schemas/client.schema";
import { validateRequiredFields } from "../models/schemas/schema";
import { ClientTable } from "../models/tables/client.table";
import { ClientService } from "../services/client.service";

const router = Router();

/**
 * GET /client/by-document
 */
router.get(
  "/client/by-document",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { document } = req.query as { document: string };

    const client = await ClientService.findClientByDocument(document);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    return res.status(200).json(client);
  }
);

/**
 * GET /client/:id
 */
router.get(
  "/client/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const client = await ClientService.findClientById(id);

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    return res.status(200).json(client);
  }
);

/**
 * GET /clients?name=&document=
 */
interface ClientQueryParams {
  name?: string;
  document?: string;
}
router.get("/clients", authMiddleware, async (req: Request, res: Response) => {
  const { name, document } = req.query as ClientQueryParams;

  const clients = await ClientService.findAll({ name, document });

  return res.status(200).json(clients);
});

/**
 * POST /client
 */
router.post("/client", authMiddleware, async (req: Request, res: Response) => {
  const validation = validateRequiredFields(req.body, clientSchema);

  if (validation.missingFields) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const { name, email, phone, document, cep, street, number, complement } =
    req.body as ClientTable;

  const clientExists = await ClientService.findClientByDocument(document);

  if (clientExists) {
    return res.status(409).json({
      message: "Cliente já cadastrado com este documento",
    });
  }

  const created = await ClientService.create({
    name,
    email,
    phone,
    document,
    cep,
    street,
    number,
    complement,
  });

  return res.status(201).json(created);
});

/**
 * PATCH /client/:id
 */
router.patch("/client/:id", authMiddleware, (req: Request, res: Response) => {
  const validation = validateRequiredFields(req.body, clientSchema);

  if (validation.missingFields) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const id = Number(req.params.id);
  const { name, email, phone, document, cep, street, number, complement } =
    req.body as ClientTable;

  const clientIndex = clients.findIndex((c) => c.id_client === id);

  if (clientIndex === -1) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }

  // Validação simples para evitar duplicidade de documento
  if (document) {
    const documentExists = clients.some(
      (c) => c.document === document && c.id_client !== id
    );

    if (documentExists) {
      return res.status(409).json({
        message: "Documento já utilizado por outro cliente",
      });
    }
  }

  clients[clientIndex] = {
    ...clients[clientIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(document && { document }),
    ...(cep && { cep }),
    ...(street && { street }),
    ...(number !== undefined && { number }),
    ...(complement !== undefined && { complement }),
  };

  return res.status(200).json(clients[clientIndex]);
});

/**
 * DELETE /client/:id
 */
router.delete("/client/:id", authMiddleware, (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const clientIndex = clients.findIndex((c) => c.id_client === id);

  if (clientIndex === -1) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }

  clients.splice(clientIndex, 1);

  return res.status(204).send();
});

export default router;
