export interface OrderItem {
  name: string;
  variant?: string;
  count: number;
  cost: number;
  removedIngredients?: string[];
  addons?: string[];
}

export type OrderStatus = 'Принято' | 'Готовится' | 'Доставляется' | 'Доставлено';

export interface OrderData {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryTime: string;
  paymentMethod: string;
  items: OrderItem[]; 
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
