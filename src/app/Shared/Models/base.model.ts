export interface BaseModel {
  _id?: string;
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TableColumn {
  name: string;
  property: string;
  sortable?: boolean;
  visible?: boolean;
  cellTemplate?: (element: any) => string;
  width?: string;
}

export interface TableAction {
  name: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  showCondition?: (element: any) => boolean;
  handler: (element: any) => void;
}
