import { inject, Injectable, signal } from '@angular/core';
import { ProductModel } from '../Models/product';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class wishListService {
  constructor() {}
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  wishLists = signal<ProductModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  readonly wishLists$ = this.wishLists.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  init() {
    this.getWishLists().subscribe();
  }

  getWishLists(): Observable<ProductModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductModel[]>(`${this.baseUrl}/customer/whishLists`).pipe(
      tap((wishLists) => {
        const uniqueWishlists = this.removeDuplicates(wishLists);
        this.wishLists.set(uniqueWishlists);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading wishlists:', error);
        this.error.set('Failed to load WishLists');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  addToWishList(product: ProductModel): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    const productId = product._id;

    if (this.wishLists().some((p) => p._id === productId)) {
      this.loading.set(false);
      return throwError(() => new Error('Product already in wishlist'));
    }

    return this.http.post<any>(`${this.baseUrl}/customer/whishLists/${productId}`, {}).pipe(
      tap(() => {
        this.wishLists.update((current) => {
          if (current.some((p) => p._id === productId)) {
            return current;
          }
          return [...current, product];
        });
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Failed to add to WishList');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  deleteWishList(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/customer/whishLists/${id}`).pipe(
      tap(() => {
        this.wishLists.update((current) => current.filter((product) => product._id !== id));
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error deleting from wishlist:', error);
        this.error.set('Failed to delete from WishList');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  isInWishList(productId: string): boolean {
    return this.wishLists$().some((x) => x._id === productId);
  }

  toggleWishList(product: ProductModel): Observable<any> {
    if (!product._id) return throwError(() => new Error('Product ID is missing'));

    if (this.isInWishList(product._id)) {
      return this.deleteWishList(product._id);
    } else {
      return this.addToWishList(product);
    }
  }

  private removeDuplicates(items: ProductModel[]): ProductModel[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      // Skip items without _id
      if (!item._id) {
        console.warn('Item without _id found:', item);
        return false;
      }
      if (seen.has(item._id)) {
        return false;
      }
      seen.add(item._id);
      return true;
    });
  }

  clearError(): void {
    this.error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
