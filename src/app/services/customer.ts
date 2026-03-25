import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ProductModel } from '../Models/product';
import { environment } from '../../environment/environment';
import { catchError, Observable, tap } from 'rxjs';
import { CategoryModel } from '../Models/category';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State management
  private products = signal<ProductModel[]>([]);
  private categories = signal<CategoryModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as readonly
  readonly products$ = this.products.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  getNewProducts(): Observable<ProductModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductModel[]>(`${this.baseUrl}/customer/new-products`).pipe(
      tap((products) => {
        this.products.set(products);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to load new Products');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  getFeaturedProducts(): Observable<ProductModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductModel[]>(`${this.baseUrl}/customer/featured-products`).pipe(
      tap((products) => {
        this.products.set(products);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to load featured Products');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  getCategories(): Observable<CategoryModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CategoryModel[]>(`${this.baseUrl}/customer/categories`).pipe(
      tap((categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to load featured Categories');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  // State management methods
  clearError(): void {
    this.error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
