import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category, Quiz } from '../../../core/models/api.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-quizzes',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './admin-quizzes.component.html',
  styleUrl: './admin-quizzes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminQuizzesComponent {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly quizApi = inject(QuizApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notifications = inject(NotificationService);
  private readonly httpError = inject(HttpErrorService);

  readonly categories = signal<Category[]>([]);
  readonly quizzes = signal<Quiz[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly search = signal('');
  readonly categoryFilter = signal('all');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly filteredQuizzes = computed(() => {
    const search = this.search().toLowerCase();
    return this.quizzes().filter((quiz) => {
      const matchesSearch =
        !search ||
        quiz.title.toLowerCase().includes(search) ||
        quiz.categoryTitle.toLowerCase().includes(search);
      const matchesCategory =
        this.categoryFilter() === 'all' ||
        String(quiz.categoryId) === this.categoryFilter();
      const matchesStatus =
        this.statusFilter() === 'all' ||
        (this.statusFilter() === 'active' ? quiz.active : !quiz.active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  });

  constructor() {
    this.loadData();
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  updateSearch(event: Event): void {
    this.setSearch((event.target as HTMLInputElement).value);
  }

  setCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
  }

  updateCategoryFilter(event: Event): void {
    this.setCategoryFilter((event.target as HTMLSelectElement).value);
  }

  setStatusFilter(value: 'all' | 'active' | 'inactive'): void {
    this.statusFilter.set(value);
  }

  updateStatusFilter(event: Event): void {
    this.setStatusFilter(
      (event.target as HTMLSelectElement).value as 'all' | 'active' | 'inactive',
    );
  }

  async deleteQuiz(quiz: Quiz): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: `Delete ${quiz.title}?`,
      message:
        'This will remove the quiz record from the admin catalog. Existing linked question data may affect whether the backend allows deletion.',
      confirmLabel: 'Delete quiz',
      cancelLabel: 'Keep quiz',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.quizApi.delete(quiz.quizId).subscribe({
      next: () => {
        this.notifications.info('Quiz deleted', `${quiz.title} was removed.`);
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to delete quiz.'),
        );
      },
    });
  }

  private loadData(): void {
    this.loading.set(true);
    forkJoin({
      categories: this.categoryApi.getAll(),
      quizzes: this.quizApi.getAll(),
    }).subscribe({
      next: ({ categories, quizzes }) => {
        this.categories.set(categories);
        this.quizzes.set(quizzes);
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
