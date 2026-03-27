import { ProductModel } from './product';

export interface CartItem {
  quantity: number;
  product: ProductModel;
}
