import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, finalize, switchMap, tap, throwError } from 'rxjs';
import {
  AuthMode,
  AuthRequest,
  AuthTokenResponse,
  User,
} from '../models/api.models';
import { AuthApiService } from './auth-api.service';
import { HttpErrorService } from './http-error.service';

const TOKEN_KEY = 'quiz_portal_token';
const USER_KEY = 'quiz_portal_user';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly httpError = inject(HttpErrorService);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly pending = signal(false);

  readonly isLoggedIn = computed(() => !!this.token() && !!this.user());
  readonly isAdmin = computed(() =>
    this.user()?.authorities.some(({ authority }) => authority === 'ADMIN') ??
    false,
  );
  readonly isLearner = computed(() =>
    this.user()?.authorities.some(({ authority }) => authority === 'NORMAL') ??
    false,
  );
  readonly displayName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) {
      return 'Guest';
    }

    return `${currentUser.firstName} ${currentUser.lastName ?? ''}`.trim();
  });

  login(credentials: AuthRequest, mode: AuthMode): Observable<User> {
    const request =
      mode === 'admin'
        ? this.authApi.loginAdmin(credentials)
        : this.authApi.login(credentials);

    this.pending.set(true);

    return request.pipe(
      tap((response) => this.storeToken(response)),
      switchMap(() => this.authApi.currentUser()),
      tap((user) => this.storeUser(user)),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => this.pending.set(false)),
    );
  }

  refreshUser(): Observable<User> {
    if (!this.token()) {
      return EMPTY;
    }

    return this.authApi.currentUser().pipe(
      tap((user) => this.storeUser(user)),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }

  logout(redirect = true): void {
    this.clearSession();
    if (redirect) {
      void this.router.navigate(['/']);
    }
  }

  ensureRoleRedirect(): string {
    if (this.isAdmin()) {
      return '/admin';
    }
    if (this.isLearner()) {
      return '/user-dashboard';
    }
    return '/';
  }

  describeError(error: unknown): string {
    return this.httpError.getMessage(error, 'Authentication failed.');
  }

  private storeToken(response: AuthTokenResponse): void {
    this.token.set(response.token);
    localStorage.setItem(TOKEN_KEY, response.token);
  }

  private storeUser(user: User): void {
    this.user.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private readUser(): User | null {
    const userValue = localStorage.getItem(USER_KEY);
    if (!userValue) {
      return null;
    }

    try {
      return JSON.parse(userValue) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
