import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Quiz } from '../../../core/models/api.models';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-quiz-instructions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-instructions.component.html',
  styleUrl: './quiz-instructions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizInstructionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly quizApi = inject(QuizApiService);
  private readonly httpError = inject(HttpErrorService);

  readonly quizId = Number(this.route.snapshot.paramMap.get('qid') ?? '0');
  readonly quiz = signal<Quiz | null>(null);
  readonly errorMessage = signal('');

  readonly estimatedMinutes = computed(() => {
    const quiz = this.quiz();
    if (!quiz) {
      return 0;
    }
    return Number(quiz.numberOfQuestions || '0') * 2;
  });

  constructor() {
    this.quizApi.getById(this.quizId).subscribe({
      next: (quiz) => this.quiz.set(quiz),
      error: (error) =>
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load instructions.'),
        ),
    });
  }
}
