import {
  ItemServiceOrderTable,
  ServiceOrderTable,
} from "../tables/service-order.table";

export interface ServiceOrderListView {
  id_service_order: number;
  description: string;
  company_name: string;
  client_name: string;
  total: number;
  created_at: Date;
}

export interface ServiceOrderView extends ServiceOrderTable {
  products: ItemServiceOrderTable[];
}
