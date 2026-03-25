import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environment/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthResponse, RegisterData } from '../Models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // State management
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as readonly
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  registerUser(userData: RegisterData): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData).pipe(
      tap((response) => {
        console.log('Registration successful:', response);
        this.loading.set(false);
        // Store token if needed
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.error.set(errorMessage);
        this.loading.set(false);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  loginUser(credentials: { email: string; password: string }): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('Login successful:', response);
        this.loading.set(false);
        // Store token if needed
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.error.set(errorMessage);
        this.loading.set(false);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  get isLoggedIn() {
    let token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    return false;
  }

  get userName() {
    let userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData).name;
    }
    return null;
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // State management methods
  clearError(): void {
    this.error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
