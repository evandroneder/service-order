export interface ServiceOrderTable {
  id_service_order: number;
  description: string;
  id_user: number;
  id_client: number;
  id_company: number;
}

export interface ItemServiceOrderTable {
  id_item_service_order: number;
  quantity: number;
  description: string;
  value: number;
  id_service_order: number;
}
