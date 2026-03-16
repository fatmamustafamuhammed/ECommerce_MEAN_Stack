import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { CategoryModel } from '../Models/category';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State management
  private categories = signal<CategoryModel[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as readonly
  readonly categories$ = this.categories.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // CRUD Operations
  getCategories(): Observable<CategoryModel[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CategoryModel[]>(`${this.baseUrl}/category/get`).pipe(
      tap(categories => {
        this.categories.set(categories);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
        throw error;
      })
    );
  }

  getCategoryById(id: string): Observable<CategoryModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CategoryModel>(`${this.baseUrl}/category/get/${id}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load category');
        this.loading.set(false);
        throw error;
      })
    );
  }

  addCategory(name: string): Observable<CategoryModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<CategoryModel>(`${this.baseUrl}/category/add`, { name }).pipe(
      tap(newCategory => {
        // Update local state
        this.categories.update(categories => [...categories, newCategory]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to add category');
        this.loading.set(false);
        throw error;
      })
    );
  }

  updateCategory(id: string, name: string): Observable<CategoryModel> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<CategoryModel>(`${this.baseUrl}/category/update/${id}`, { name }).pipe(
      tap(updatedCategory => {
        // Update local state
        this.categories.update(categories =>
          categories.map(c => c._id === id ? updatedCategory : c)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update category');
        this.loading.set(false);
        throw error;
      })
    );
  }

  deleteCategoryById(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/category/delete/${id}`).pipe(
      tap(() => {
        // Update local state
        this.categories.update(categories =>
          categories.filter(c => c._id !== id)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete category');
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
