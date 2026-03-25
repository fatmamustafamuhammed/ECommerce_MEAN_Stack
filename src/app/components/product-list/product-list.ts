import { Component, inject, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';
import { ProductCard } from '../product-card/product-card';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { CategoryModel } from '../../Models/category';
import { BrandModel } from '../../Models/brand';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, MatSelectModule, FormsModule, MatButtonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  customerService = inject(CustomerService);
  searchTerm: string = '';
  categoryId: string = '';
  sortBy: string = '';
  sortOrder: number = -1;
  brandId: string = '';
  page = 1;
  pageSize = 6;
  products: ProductModel[] = [];
  route = inject(ActivatedRoute);
  categories: CategoryModel[] = [];
  brands: BrandModel[] = [];
  isNext: boolean = true;

  ngOnInit() {
    this.customerService.getCategories().subscribe((result) => {
      this.categories = result;
    });
    this.customerService.getBrands().subscribe((result) => {
      this.brands = result;
    });

    this.route.queryParams.subscribe((params) => {
      console.log('Query params:', params);

      // Match the parameter name from header
      this.searchTerm = params['search'] || '';
      this.categoryId = params['categoryId'] || '';
      this.sortBy = params['sortBy'] || '';
      this.brandId = params['brandId'] || '';
      this.page = params['page'] ? parseInt(params['page']) : 1;

      console.log('Search term:', this.searchTerm);
      console.log('Category ID:', this.categoryId);

      this.getProducts();
    });
  }

  getProducts() {
    console.log('Calling getProducts with:', {
      searchTerm: this.searchTerm,
      categoryId: this.categoryId,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      brandId: this.brandId,
      page: this.page,
      pageSize: this.pageSize,
    });

    setTimeout(() => {
      this.customerService
        .getProducts(
          this.searchTerm,
          this.categoryId,
          this.sortBy,
          this.sortOrder,
          this.brandId,
          this.page,
          this.pageSize,
        )
        .subscribe({
          next: (result) => {
            console.log('Products received:', result);
            this.products = result;
            if (result.length < this.pageSize) {
              this.isNext = false;
            }
          },
          error: (error) => {
            console.error('Error loading products:', error);
          },
        });
    }, 2000);
  }

  orderChange(event: any) {
    console.log('Order change event:', event);
    this.sortBy = 'price';
    this.sortOrder = Number(event);
    this.page = 1;
    this.getProducts();
  }
  pageChange(page: number) {
    this.page = page;
    this.isNext = true;
    this.getProducts();
  }
}
