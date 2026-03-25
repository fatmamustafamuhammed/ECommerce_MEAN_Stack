import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { ProductModel } from '../Models/product';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State management
  private products = signal<ProductModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as readonly
  readonly products$ = this.products.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // CRUD Operations
  getProducts(): Observable<ProductModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductModel[]>(`${this.baseUrl}/product/get`).pipe(
      tap((products) => {
        this.products.set(products);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  getProductById(id: string): Observable<ProductModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductModel>(`${this.baseUrl}/product/get/${id}`).pipe(
      tap((product) => {
        this.loading.set(false);
        return product;
      }),
      catchError((error) => {
        this.error.set('Failed to load product');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  // Updated to accept full ProductModel
  addProduct(product: ProductModel): Observable<ProductModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ProductModel>(`${this.baseUrl}/product/add`, product).pipe(
      tap((newProduct) => {
        // Update local state
        this.products.update((products) => [...products, newProduct]);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to add product');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  // Updated to accept full ProductModel
  updateProduct(id: string, product: ProductModel): Observable<ProductModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ProductModel>(`${this.baseUrl}/product/update/${id}`, product).pipe(
      tap((updatedProduct) => {
        // Update local state
        this.products.update((products) =>
          products.map((p) => (p._id === id ? updatedProduct : p)),
        );
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to update product');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  addProductSimple(name: string): Observable<ProductModel> {
    return this.addProduct({
      name,
      shortDescription: '',
      description: '',
      price: 0,
      discount: 0,
      images: [],
      categoryId: '',
      brandId: '',
      isFeatured: false,
      isnew: false,
    } as ProductModel);
  }

  updateProductSimple(id: string, name: string): Observable<ProductModel> {
    // First get the existing product
    return this.getProductById(id).pipe(
      tap((existingProduct) => {
        const updatedProduct = { ...existingProduct, name };
        this.updateProduct(id, updatedProduct).subscribe();
      }),
    );
  }

  deleteProductById(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/product/delete/${id}`).pipe(
      tap(() => {
        // Update local state
        this.products.update((products) => products.filter((p) => p._id !== id));
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to delete product');
        this.loading.set(false);
        throw error;
      }),
    );
  }

  uploadImages(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/product/upload`, formData);
  }

  deleteImage(productId: string, imageUrl: string): Observable<any> {
    if (!productId || productId === 'temp' || productId === 'undefined' || productId === 'null') {
      console.warn('Invalid productId for image deletion:', productId);
      return of({ message: 'Skipped deletion - invalid product ID' });
    }

    const encodedUrl = encodeURIComponent(imageUrl);
    const url = `${this.baseUrl}/product/delete-image/${productId}/${encodedUrl}`;
    console.log('DELETE Request URL:', url);

    return this.http.delete(url).pipe(
      tap((response) => console.log('Delete response:', response)),
      catchError((error) => {
        console.error('Delete error:', error);
        throw error;
      }),
    );
  }
}
