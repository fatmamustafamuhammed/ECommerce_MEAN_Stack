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
import { Login } from './components/login/login';
import { authGuard } from './core/auth-guard';
import { AdminDashboard } from './components/manage/admin-dashboard/admin-dashboard';
import { adminGuard } from './core/admin-guard';
import { CustomerProfile } from './components/customer-profile/customer-profile';
import { Whishlists } from './components/whishlists/whishlists';

export const routes: Routes = [
  // Auth Guard
  {
    path: '',
    component: Home,
    canActivate: [authGuard],
  },
  {
    path: 'products',
    component: ProductList,
    canActivate: [authGuard],
  },
  {
    path: 'product/:id',
    component: ProductDetails,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: CustomerProfile,
    canActivate: [authGuard],
  },
  {
    path: 'whishlists',
    component: Whishlists,
    canActivate: [authGuard],
  },

  ////////////////////////////////

  // Admin Guard
  {
    path: 'admin/admin-dashboard',
    component: AdminDashboard,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/categories',
    component: Categories,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/categories/add',
    component: CategoryForm,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/categories/:id',
    component: CategoryForm,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/brands',
    component: Brands,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/brands/add',
    component: BrandForm,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/brands/:id',
    component: BrandForm,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/products',
    component: Products,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/products/add',
    component: ProductForm,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/products/:id',
    component: ProductForm,
    canActivate: [adminGuard],
  },
  ////////////////////////////////
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'login',
    component: Login,
  },
];
