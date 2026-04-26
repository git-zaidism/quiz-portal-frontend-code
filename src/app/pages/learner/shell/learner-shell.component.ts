import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Category } from '../../../core/models/api.models';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { HttpErrorService } from '../../../core/services/http-error.service';

@Component({
  selector: 'app-learner-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './learner-shell.component.html',
  styleUrl: './learner-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnerShellComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly httpError = inject(HttpErrorService);

  readonly authSession = inject(AuthSessionService);
  readonly categories = signal<Category[]>([]);
  readonly errorMessage = signal('');

  constructor() {
    this.categoryApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error) =>
          this.errorMessage.set(
            this.httpError.getMessage(error, 'Unable to load categories.'),
          ),
      });
  }
}
