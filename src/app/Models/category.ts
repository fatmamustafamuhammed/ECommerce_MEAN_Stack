import { BaseModel } from '../Shared/Models/base.model';

export interface CategoryModel extends BaseModel {
  _id?: string;
  name: string;
}
