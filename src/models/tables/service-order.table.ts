export interface ServiceOrder {
  id_service_order: number;
  code: string;
  description: string;
  id_user: number;
  id_client: number;
  id_company: number;
  products: ItemServiceOrder[];
}

export interface ItemServiceOrder {
  id_item_service_order: number;
  quantity: number;
  description: string;
  value: number;
  id_service_order: number;
}
