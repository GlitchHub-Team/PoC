import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly userName = computed(() => this.currentUserSignal()?.username ?? '');
  readonly userTenant = computed(() => this.currentUserSignal()?.tenant ?? null);
  readonly tenantName = computed(() => this.currentUserSignal()?.tenant?.name ?? 'No Organization');

  constructor() {
    this.loadFromStorage();

    effect(() => {
      const token = this.tokenSignal();
      const user = this.currentUserSignal();

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    });
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;

        if (this.isTokenValid(token)) {
          this.tokenSignal.set(token);
          this.currentUserSignal.set(user);
        } else {
          this.clearStorage();
        }
      } catch {
        this.clearStorage();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Math.floor(Date.now() / 1000);
      return isValid;
    } catch {
      return false;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.currentUserSignal.set(response.user);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.currentUserSignal.set(response.user);
      })
    );
  }

  refreshProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    )
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = this.tokenSignal();
    return token;
  }
}