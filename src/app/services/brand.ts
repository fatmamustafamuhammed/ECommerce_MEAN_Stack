import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { BrandModel } from '../Models/brand';
@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State management
  private brands = signal<BrandModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as readonly
  readonly brands$ = this.brands.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // CRUD Operations
  getBrands(): Observable<BrandModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<BrandModel[]>(`${this.baseUrl}/brand/get`).pipe(
      tap(brands => {
        this.brands.set(brands);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load brands');
        this.loading.set(false);
        throw error;
      })
    );
  }

  getBrandById(id: string): Observable<BrandModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<BrandModel>(`${this.baseUrl}/brand/get/${id}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load brand');
        this.loading.set(false);
        throw error;
      })
    );
  }

  addBrand(name: string): Observable<BrandModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<BrandModel>(`${this.baseUrl}/brand/add`, { name }).pipe(
      tap(newBrand => {
        // Update local state
        this.brands.update(brands => [...brands, newBrand]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to add brand');
        this.loading.set(false);
        throw error;
      })
    );
  }

  updateBrand(id: string, name: string): Observable<BrandModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<BrandModel>(`${this.baseUrl}/brand/update/${id}`, { name }).pipe(
      tap(updatedBrand => {
        // Update local state
        this.brands.update(brands =>
          brands.map(c => c._id === id ? updatedBrand : c)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update brand');
        this.loading.set(false);
        throw error;
      })
    );
  }

  deleteBrandById(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/brand/delete/${id}`).pipe(
      tap(() => {
        // Update local state
        this.brands.update(brands =>
          brands.filter(c => c._id !== id)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete brand');
        this.loading.set(false);
        throw error;
      })
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
