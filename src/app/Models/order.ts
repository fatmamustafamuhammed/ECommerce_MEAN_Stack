import { CartItem } from "./cart";

export interface Order {
  _id?: string;
  items: CartItem[];
  paymentType: string;
  address: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  date: Date;
  totalAmount: number;
  status?: string;
}