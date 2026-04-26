import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { QuestionAttempt, Quiz, QuizEvaluationResponse } from '../../../core/models/api.models';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuestionApiService } from '../../../core/services/question-api.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-attempt.component.html',
  styleUrl: './quiz-attempt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizAttemptComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly quizApi = inject(QuizApiService);
  private readonly questionApi = inject(QuestionApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notifications = inject(NotificationService);
  private readonly httpError = inject(HttpErrorService);

  readonly quizId = Number(this.route.snapshot.paramMap.get('qid') ?? '0');
  readonly quiz = signal<Quiz | null>(null);
  readonly questions = signal<QuestionAttempt[]>([]);
  readonly answers = signal<Record<number, string>>({});
  readonly currentIndex = signal(0);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<QuizEvaluationResponse | null>(null);
  readonly timeLeft = signal(0);

  readonly currentQuestion = computed(
    () => this.questions()[this.currentIndex()] ?? null,
  );
  readonly attemptedCount = computed(
    () => Object.values(this.answers()).filter((value) => !!value).length,
  );
  readonly formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  private timerId: number | null = null;

  constructor() {
    forkJoin({
      quiz: this.quizApi.getById(this.quizId),
      questions: this.questionApi.getAttemptQuestions(this.quizId),
    }).subscribe({
      next: ({ quiz, questions }) => {
        this.quiz.set(quiz);
        this.questions.set(questions);
        this.timeLeft.set(questions.length * 120);
        this.startTimer();
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to start quiz.'),
        );
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  pickAnswer(value: string): void {
    const question = this.currentQuestion();
    if (!question || this.result()) {
      return;
    }

    this.answers.update((answers) => ({
      ...answers,
      [question.questionId]: value,
    }));
  }

  jumpTo(index: number): void {
    this.currentIndex.set(index);
  }

  next(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update((value) => value + 1);
    }
  }

  previous(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((value) => value - 1);
    }
  }

  async submit(): Promise<void> {
    if (this.result() || this.submitting()) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Submit quiz now?',
      message:
        'Your current answers will be sent to the backend for scoring immediately. You will not continue editing after submission.',
      confirmLabel: 'Submit quiz',
      cancelLabel: 'Continue answering',
    });

    if (!confirmed) {
      return;
    }

    this.finalizeQuiz();
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerId = window.setInterval(() => {
      const next = this.timeLeft() - 1;
      if (next <= 0) {
        this.timeLeft.set(0);
        this.finalizeQuiz(true);
        return;
      }
      this.timeLeft.set(next);
    }, 1000);
  }

  private finalizeQuiz(auto = false): void {
    this.clearTimer();
    this.submitting.set(true);

    const payload = this.questions().map((question) => ({
      questionId: question.questionId,
      givenAnswer: this.answers()[question.questionId] ?? '',
    }));

    this.questionApi.evaluate(payload).subscribe({
      next: (result) => {
        this.result.set(result);
        this.submitting.set(false);
        this.notifications.success(
          auto ? 'Time is up' : 'Quiz submitted',
          'Your answers have been scored.',
        );
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to submit quiz.'),
        );
        this.submitting.set(false);
      },
    });
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
