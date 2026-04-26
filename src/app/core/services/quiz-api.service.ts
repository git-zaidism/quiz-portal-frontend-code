import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz, QuizPayload } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quiz`);
  }

  getById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/quiz/${quizId}`);
  }

  create(payload: QuizPayload): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/quiz`, payload);
  }

  update(payload: QuizPayload): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/quiz`, payload);
  }

  delete(quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/quiz/${quizId}`);
  }

  getByCategory(categoryId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quiz/category/${categoryId}`);
  }

  getActive(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quiz/active`);
  }

  getActiveByCategory(categoryId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(
      `${this.apiUrl}/quiz/category/active/${categoryId}`,
    );
  }
}
