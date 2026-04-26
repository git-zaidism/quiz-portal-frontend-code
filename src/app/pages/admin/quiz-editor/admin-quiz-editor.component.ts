import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../../core/models/api.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-admin-quiz-editor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-quiz-editor.component.html',
  styleUrl: './admin-quiz-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminQuizEditorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly quizApi = inject(QuizApiService);
  private readonly notifications = inject(NotificationService);
  private readonly httpError = inject(HttpErrorService);

  readonly quizId = Number(this.route.snapshot.paramMap.get('qid') ?? '0');
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    quizId: [0],
    title: ['', [Validators.required]],
    description: [''],
    maxMarks: ['100', [Validators.required]],
    numberOfQuestions: ['10', [Validators.required]],
    active: [true, [Validators.required]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    if (this.quizId > 0) {
      forkJoin({
        categories: this.categoryApi.getAll(),
        quiz: this.quizApi.getById(this.quizId),
      }).subscribe({
        next: ({ categories, quiz }) => {
          this.categories.set(categories);
          this.form.setValue({
            quizId: quiz.quizId,
            title: quiz.title,
            description: quiz.description ?? '',
            maxMarks: quiz.maxMarks,
            numberOfQuestions: quiz.numberOfQuestions,
            active: quiz.active,
            categoryId: quiz.categoryId,
          });
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            this.httpError.getMessage(error, 'Unable to load quiz editor.'),
          );
          this.loading.set(false);
        },
      });
      return;
    }

    this.categoryApi.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load categories.'),
        );
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request =
      this.quizId > 0 ? this.quizApi.update(payload) : this.quizApi.create(payload);

    request.subscribe({
      next: (quiz) => {
        this.notifications.success(
          this.quizId > 0 ? 'Quiz updated' : 'Quiz created',
          `${quiz.title} is ready.`,
        );
        this.saving.set(false);
        void this.router.navigate(['/admin/quizzes']);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to save quiz.'),
        );
        this.saving.set(false);
      },
    });
  }
}
