import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Quiz } from '../../../core/models/api.models';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './learner-dashboard.component.html',
  styleUrl: './learner-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnerDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly quizApi = inject(QuizApiService);
  private readonly httpError = inject(HttpErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly quizzes = signal<Quiz[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly title = signal('Active quizzes');

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const categoryId = Number(params.get('catId') ?? '0');
        this.loadQuizzes(categoryId);
      });
  }

  private loadQuizzes(categoryId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const request =
      categoryId > 0
        ? this.quizApi.getActiveByCategory(categoryId)
        : this.quizApi.getActive();

    request.subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.title.set(categoryId > 0 ? 'Category quiz set' : 'Active quizzes');
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load quizzes.'),
        );
        this.loading.set(false);
      },
    });
  }
}
