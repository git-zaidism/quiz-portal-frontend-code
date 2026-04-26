import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryPayload } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/category`);
  }

  getById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/${categoryId}`);
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/category`, payload);
  }

  update(payload: CategoryPayload): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/category`, payload);
  }

  delete(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/category/${categoryId}`);
  }
}
