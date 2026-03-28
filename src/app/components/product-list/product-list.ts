import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';
import { ProductCard } from '../product-card/product-card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { CategoryModel } from '../../Models/category';
import { BrandModel } from '../../Models/brand';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FilterStateService } from '../../Shared/Services/Filter-State-service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, MatSelectModule, FormsModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  customerService = inject(CustomerService);
  router = inject(Router);
  filterStateService = inject(FilterStateService);
  searchTerm: string = '';
  categoryId: string = '';
  sortBy: string = '';
  sortOrder: number = -1;
  brandId: string = '';
  page = 1;
  pageSize = 2;
  products: ProductModel[] = [];
  route = inject(ActivatedRoute);
  categories: CategoryModel[] = [];
  brands: BrandModel[] = [];
  isNext: boolean = true;
  cdr = inject(ChangeDetectorRef);

  private clearFiltersSubscription: Subscription = new Subscription();

  ngOnInit() {
    // Load categories and brands
    this.customerService.getCategories().subscribe((result) => {
      this.categories = result;
    });

    this.customerService.getBrands().subscribe((result) => {
      this.brands = result;
    });

    // Subscribe to query params
    this.route.queryParams.subscribe((params) => {
      console.log('Query params received:', params);

      // Update filters from URL
      this.searchTerm = params['search'] || '';
      this.categoryId = params['categoryId'] || '';
      this.brandId = params['brandId'] || '';
      this.sortBy = params['sortBy'] || '';
      this.sortOrder = params['sortOrder'] ? parseInt(params['sortOrder']) : -1;
      this.page = params['page'] ? parseInt(params['page']) : 1;

      console.log('Updated filters:', {
        searchTerm: this.searchTerm,
        categoryId: this.categoryId,
        brandId: this.brandId,
      });

      this.getProducts();
    });

    // Subscribe to clear filters event
    this.clearFiltersSubscription = this.filterStateService.clearFilters$.subscribe(
      (shouldClear) => {
        if (shouldClear) {
          console.log('ProductList: Received clear filters event');
          this.resetAllFilters();
        }
      },
    );
  }

  ngOnDestroy() {
    if (this.clearFiltersSubscription) {
      this.clearFiltersSubscription.unsubscribe();
    }
  }

  resetAllFilters() {
    console.log('Resetting all filters');

    // Clear URL params first
    this.router
      .navigate(['/products'], {
        queryParams: {},
        queryParamsHandling: '',
      })
      .then(() => {
        // After navigation, reset all properties
        this.searchTerm = '';
        this.categoryId = '';
        this.brandId = '';
        this.sortBy = '';
        this.sortOrder = -1;
        this.page = 1;

        console.log('Filters reset to:', {
          categoryId: this.categoryId,
          brandId: this.brandId,
        });

        // Force UI update by reassigning the arrays
        const tempCategories = [...this.categories];
        this.categories = [];
        this.cdr.detectChanges();
        this.categories = tempCategories;

        const tempBrands = [...this.brands];
        this.brands = [];
        this.cdr.detectChanges();
        this.brands = tempBrands;

        this.cdr.detectChanges();
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

    this.isNext = true;

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

          this.isNext = result.length === this.pageSize;

          console.log('Is next page available:', this.isNext);
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isNext = false;
        },
      });
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
    this.getProducts();
  }

  clearAllFilters() {
    console.log('ProductList: Manual clear all filters');
    this.resetAllFilters();
  }
}