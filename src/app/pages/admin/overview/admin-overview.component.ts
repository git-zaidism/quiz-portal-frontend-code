import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Quiz } from '../../../core/models/api.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewComponent {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly quizApi = inject(QuizApiService);
  private readonly httpError = inject(HttpErrorService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly categoryCount = signal(0);
  readonly quizCount = signal(0);
  readonly activeQuizCount = signal(0);
  readonly recentQuizzes = signal<Quiz[]>([]);

  readonly inactiveQuizCount = computed(
    () => this.quizCount() - this.activeQuizCount(),
  );

  constructor() {
    forkJoin({
      categories: this.categoryApi.getAll(),
      quizzes: this.quizApi.getAll(),
    }).subscribe({
      next: ({ categories, quizzes }) => {
        this.categoryCount.set(categories.length);
        this.quizCount.set(quizzes.length);
        this.activeQuizCount.set(quizzes.filter((quiz) => quiz.active).length);
        this.recentQuizzes.set(quizzes.slice(0, 4));
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load overview data.'),
        );
        this.loading.set(false);
      },
    });
  }
}
