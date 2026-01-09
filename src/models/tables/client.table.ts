export interface Client {
  id_client: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  cep: string;
  street: string;
  number: number;
  complement?: string;
}
