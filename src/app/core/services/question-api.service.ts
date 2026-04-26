import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Question,
  QuestionAttempt,
  QuestionEvaluationRequest,
  QuestionPayload,
  QuizEvaluationResponse,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class QuestionApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAttemptQuestions(quizId: number): Observable<QuestionAttempt[]> {
    return this.http.get<QuestionAttempt[]>(
      `${this.apiUrl}/question/quiz/${quizId}`,
    );
  }

  getAdminQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${this.apiUrl}/question/quiz/all/${quizId}`,
    );
  }

  getById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/question/${questionId}`);
  }

  create(payload: QuestionPayload): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/question`, payload);
  }

  update(payload: QuestionPayload): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/question`, payload);
  }

  delete(questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/question/${questionId}`);
  }

  evaluate(
    payload: QuestionEvaluationRequest[],
  ): Observable<QuizEvaluationResponse> {
    return this.http.post<QuizEvaluationResponse>(
      `${this.apiUrl}/question/eval-quiz`,
      payload,
    );
  }
}
