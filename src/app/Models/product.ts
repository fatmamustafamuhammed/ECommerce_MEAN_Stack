import { BaseModel } from '../Shared/Models/base.model';

export interface ProductModel extends BaseModel {
  _id?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  categoryId: string;
  isFeatured: Boolean;
  isnew: Boolean;
}
