import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, catchError, Observable, tap, throwError, timer, interval, Subscription } from 'rxjs';
import { AuthResponse, RegisterData } from '../Models/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;
  private tokenExpirationTimer: Subscription | null = null;

  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();

  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  constructor() {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      if (this.isTokenValid(token)) {
        this.authState.next(true);
        this.startExpirationTimer(token);
      } else {
        this.logout();
      }
    } else {
      this.authState.next(false);
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; 
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private getTokenExpirationTime(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      return expirationTime - currentTime;
    } catch (error) {
      return 0;
    }
  }

  private startExpirationTimer(token: string): void {
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
    }

    const expirationDelay = this.getTokenExpirationTime(token);

    if (expirationDelay > 0) {
      this.tokenExpirationTimer = timer(expirationDelay).subscribe(() => {
        this.logout('Session expired. Please login again.');
      });
    } else {
      this.logout('Session expired. Please login again.');
    }
  }

  registerUser(userData: RegisterData): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData).pipe(
      tap((response) => {
        this.loading.set(false);
        if (response.token) {
          this.setSession(response.token, response.user);
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
        this.loading.set(false);
        if (response.token) {
          this.setSession(response.token, response.user);
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

  private setSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authState.next(true);
    this.startExpirationTimer(token);
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (token && this.isTokenValid(token)) {
      return true;
    }
    return false;
  }

  get isAdmin() {
    let userData = localStorage.getItem('user');
    if (userData && this.isLoggedIn) {
      return JSON.parse(userData).isAdmin;
    }
    return false;
  }

  get userName() {
    let userData = localStorage.getItem('user');
    if (userData && this.isLoggedIn) {
      return JSON.parse(userData).name;
    }
    return null;
  }

  get userEmail() {
    let userData = localStorage.getItem('user');
    if (userData && this.isLoggedIn) {
      return JSON.parse(userData).email;
    }
    return null;
  }

  logout(message?: string): void {
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.unsubscribe();
      this.tokenExpirationTimer = null;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authState.next(false);

    if (message) {
      console.log(message);
    }

    if (this.router.url !== '/login') {
      this.router.navigate(['/login'], {
        queryParams: { sessionExpired: true }
      });
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this.loading.set(isLoading);
  }
}
