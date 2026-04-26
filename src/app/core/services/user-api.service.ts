import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreateRequest } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  createUser(payload: UserCreateRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, payload);
  }
}
