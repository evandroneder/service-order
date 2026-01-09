import { Router, Request, Response } from "express";
import { validateRequiredFields } from "../models/schemas/schema";
import { clientSchema } from "../models/schemas/client.schema";
import { Client } from "../models/tables/client.table";
import { clients } from "../mocks/clients.mock";
import { adminMiddleware } from "../middlewares/adm.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * Mock de banco em memória
 * Substitua facilmente por Service / Repository
 */
let nextId = 1;

/**
 * GET /client/:id
 */
router.get("/client/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const client = clients.find((c) => c.id_client === id);

  if (!client) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }

  return res.status(200).json(client);
});

/**
 * GET /clients?name=&document=
 */
interface ClientQueryParams {
  name?: string;
  document?: string;
}
router.get("/clients", (req: Request, res: Response) => {
  const { name, document } = req.query as ClientQueryParams;

  let result = clients;

  if (name) {
    result = result.filter((c) =>
      c.name.toLowerCase().includes(String(name).toLowerCase())
    );
  }

  if (document) {
    result = result.filter((c) => c.document.includes(String(document)));
  }

  return res.status(200).json(result);
});

/**
 * POST /client
 */
router.post("/client", (req: Request, res: Response) => {
  const validation = validateRequiredFields<Client>(req.body, clientSchema);

  if (validation.missingFields) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const { name, email, phone, document, cep, street, number, complement } =
    req.body as Client;
  const clientExists = clients.some((c) => c.document === document);

  if (clientExists) {
    return res.status(409).json({
      message: "Cliente já cadastrado com este documento",
    });
  }

  const newClient: Client = {
    id_client: nextId++,
    name,
    email,
    phone,
    document,
    cep,
    street,
    number,
    complement,
  };

  clients.push(newClient);

  return res.status(201).json(newClient);
});

/**
 * PATCH /client/:id
 */
router.patch("/client/:id", (req: Request, res: Response) => {
  const validation = validateRequiredFields<Client>(req.body, clientSchema);

  if (validation.missingFields) {
    return res.status(400).json({
      message: validation.message,
    });
  }

  const id = Number(req.params.id);
  const { name, email, phone, document, cep, street, number, complement } =
    req.body as Client;

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
router.delete("/client/:id", adminMiddleware, (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const clientIndex = clients.findIndex((c) => c.id_client === id);

  if (clientIndex === -1) {
    return res.status(404).json({ message: "Cliente não encontrado" });
  }

  clients.splice(clientIndex, 1);

  return res.status(204).send();
});

export default router;
