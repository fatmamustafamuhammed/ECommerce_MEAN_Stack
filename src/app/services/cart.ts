import { inject, Injectable, signal } from '@angular/core';
import { ProductModel } from '../Models/product';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

export interface CartItem {
  quantity: number;
  product: ProductModel;
}

@Injectable({
  providedIn: 'root',
})
export class cartService {
  constructor() {}
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  carts = signal<ProductModel[]>([]);
  private cartItems = signal<CartItem[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  readonly carts$ = this.carts.asReadonly();
  readonly cartItems$ = this.cartItems.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  init() {
    this.getCarts().subscribe();
  }

  getCarts(): Observable<CartItem[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CartItem[]>(`${this.baseUrl}/customer/carts`).pipe(
      tap((cartItems) => {
        console.log('Cart loaded:', cartItems);
        this.cartItems.set(cartItems);
        const products = cartItems.map((item) => item.product);
        this.carts.set(products);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading carts:', error);
        this.error.set('Failed to load Carts');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  addToCart(product: ProductModel, quantity: number = 1): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    const productId = product._id;

    return this.http.post<any>(`${this.baseUrl}/customer/carts/${productId}`, { quantity }).pipe(
      tap((response) => {
        console.log('Add to cart response:', response);

        this.getCarts().subscribe({
          next: () => this.loading.set(false),
          error: () => this.loading.set(false),
        });
      }),
      catchError((error) => {
        console.error('Error adding to cart:', error);
        this.error.set('Failed to add to Cart');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  decreaseFromCart(product: ProductModel, quantity: number = 1): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    const productId = product._id;
    const negativeQuantity = -Math.abs(quantity);

    return this.http
      .post<any>(`${this.baseUrl}/customer/carts/${productId}`, { quantity: negativeQuantity })
      .pipe(
        tap((response) => {
          console.log('Decrease from cart response:', response);

          this.getCarts().subscribe({
            next: () => this.loading.set(false),
            error: () => this.loading.set(false),
          });
        }),
        catchError((error) => {
          console.error('Error decreasing from cart:', error);
          this.error.set('Failed to update Cart');
          this.loading.set(false);
          return throwError(() => error);
        }),
      );
  }

  updateQuantity(productId: string, currentQuantity: number, newQuantity: number): Observable<any> {
    const difference = newQuantity - currentQuantity;

    if (difference === 0) {
      return new Observable((subscriber) => {
        subscriber.next(null);
        subscriber.complete();
      });
    }

    if (newQuantity <= 0) {
      return this.deleteCart(productId);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<any>(`${this.baseUrl}/customer/carts/${productId}`, { quantity: difference })
      .pipe(
        tap((response) => {
          console.log('Update quantity response:', response);

          this.getCarts().subscribe({
            next: () => this.loading.set(false),
            error: () => this.loading.set(false),
          });
        }),
        catchError((error) => {
          console.error('Error updating cart quantity:', error);
          this.error.set('Failed to update Cart');
          this.loading.set(false);
          return throwError(() => error);
        }),
      );
  }

  deleteCart(productId: string): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<any>(`${this.baseUrl}/customer/carts/${productId}`).pipe(
      tap((response) => {
        console.log('Delete cart response:', response);

        this.getCarts().subscribe({
          next: () => this.loading.set(false),
          error: () => this.loading.set(false),
        });
      }),
      catchError((error) => {
        console.error('Error deleting from cart:', error);
        this.error.set('Failed to delete from Cart');
        this.loading.set(false);
        return throwError(() => error);
      }),
    );
  }

  isInCart(productId: string): boolean {
    return this.carts$().some((x) => x._id === productId);
  }

  getQuantity(productId: string): number {
    const cartItem = this.cartItems().find((item) => item.product._id === productId);
    return cartItem ? cartItem.quantity : 0;
  }

  getCartTotal(): number {
    return this.cartItems().reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity;
    }, 0);
  }

  getTotalItems(): number {
    return this.cartItems().reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }

  clearError(): void {
    this.error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
