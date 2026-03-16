import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environment/environment';
import { CategoryModel } from '../Models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public signals
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Helper methods
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }

  clearError() {
    this._error.set(null);
  }

  // API Methods
  getCategories() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<CategoryModel[]>(`${this.baseUrl}/category/get`)
      .pipe(finalize(() => this._loading.set(false)));
  }

  getCategoryById(id: string) {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<CategoryModel>(`${this.baseUrl}/category/get/${id}`)
      .pipe(finalize(() => this._loading.set(false)));
  }

  addCategory(name: string) {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post(`${this.baseUrl}/category/add`, { name: name.trim() })
      .pipe(finalize(() => this._loading.set(false)));
  }

  updateCategory(id: string, name: string) {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put(`${this.baseUrl}/category/update/${id}`, { name: name.trim() })
      .pipe(finalize(() => this._loading.set(false)));
  }

  deleteCategoryById(id: string) {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .delete(`${this.baseUrl}/category/delete/${id}`)
      .pipe(finalize(() => this._loading.set(false)));
  }
}
