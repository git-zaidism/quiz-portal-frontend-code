import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthTokenResponse, User } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  login(credentials: AuthRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(
      `${this.apiUrl}/generate-token`,
      credentials,
    );
  }

  loginAdmin(credentials: AuthRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(
      `${this.apiUrl}/generate-admin-token`,
      credentials,
    );
  }

  currentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/current-user`);
  }
}
