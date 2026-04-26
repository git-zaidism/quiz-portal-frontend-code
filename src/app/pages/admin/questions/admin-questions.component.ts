import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Question, Quiz } from '../../../core/models/api.models';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuestionApiService } from '../../../core/services/question-api.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './admin-questions.component.html',
  styleUrl: './admin-questions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminQuestionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly quizApi = inject(QuizApiService);
  private readonly questionApi = inject(QuestionApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notifications = inject(NotificationService);
  private readonly httpError = inject(HttpErrorService);

  readonly quizId = Number(this.route.snapshot.paramMap.get('qid') ?? '0');
  readonly quiz = signal<Quiz | null>(null);
  readonly questions = signal<Question[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    questionId: [0],
    content: ['', [Validators.required]],
    image: [''],
    option1: ['', [Validators.required]],
    option2: ['', [Validators.required]],
    option3: ['', [Validators.required]],
    option4: ['', [Validators.required]],
    answer: ['', [Validators.required]],
    quizId: [this.quizId, [Validators.required]],
  });

  constructor() {
    this.loadData();
  }

  editQuestion(question: Question): void {
    this.form.setValue({
      questionId: question.questionId,
      content: question.content,
      image: question.image ?? '',
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      answer: question.answer,
      quizId: this.quizId,
    });
  }

  resetForm(): void {
    this.form.reset({
      questionId: 0,
      content: '',
      image: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      answer: '',
      quizId: this.quizId,
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request = payload.questionId
      ? this.questionApi.update(payload)
      : this.questionApi.create(payload);

    request.subscribe({
      next: () => {
        this.notifications.success(
          payload.questionId ? 'Question updated' : 'Question created',
          'The question list has been refreshed.',
        );
        this.resetForm();
        this.loadData();
        this.saving.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to save question.'),
        );
        this.saving.set(false);
      },
    });
  }

  async deleteQuestion(question: Question): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Delete this question?',
      message:
        'This action removes the question from the quiz and cannot be undone from the current admin flow.',
      confirmLabel: 'Delete question',
      cancelLabel: 'Keep question',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.questionApi.delete(question.questionId).subscribe({
      next: () => {
        this.notifications.info('Question deleted', 'The question was removed.');
        this.loadData();
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to delete question.'),
        );
      },
    });
  }

  private loadData(): void {
    this.loading.set(true);
    forkJoin({
      quiz: this.quizApi.getById(this.quizId),
      questions: this.questionApi.getAdminQuestions(this.quizId),
    }).subscribe({
      next: ({ quiz, questions }) => {
        this.quiz.set(quiz);
        this.questions.set(questions);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load questions.'),
        );
        this.loading.set(false);
      },
    });
  }
}
