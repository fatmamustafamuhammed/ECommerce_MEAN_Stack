import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Categories } from './components/manage/categories/categories';
import { CategoryForm } from './components/manage/category-form/category-form';
import { Brands } from './components/manage/brands/brands';
import { BrandForm } from './components/manage/brand-form/brand-form';
import { Products } from './components/manage/products/products';
import { ProductForm } from './components/manage/product-form/product-form';
import { ProductList } from './components/product-list/product-list';
import { ProductDetails } from './components/product-details/product-details';
import { Register } from './components/register/register';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'admin/categories',
    component: Categories,
  },
  {
    path: 'admin/categories/add',
    component: CategoryForm,
  },
  {
    path: 'admin/categories/:id',
    component: CategoryForm,
  },
  ////////////////////////////////
  {
    path: 'admin/brands',
    component: Brands,
  },
  {
    path: 'admin/brands/add',
    component: BrandForm,
  },
  {
    path: 'admin/brands/:id',
    component: BrandForm,
  },
  ////////////////////////////////
  {
    path: 'admin/products',
    component: Products,
  },
  {
    path: 'admin/products/add',
    component: ProductForm,
  },
  {
    path: 'admin/products/:id',
    component: ProductForm,
  },
  ////////////////////////////////
  {
    path: 'products',
    component: ProductList,
  },
  {
    path: 'product/:id',
    component: ProductDetails,
  },
  ////////////////////////////////
  {
    path: 'register',
    component: Register,
  },
];
