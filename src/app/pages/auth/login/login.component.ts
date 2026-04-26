import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthMode } from '../../../core/models/api.models';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authSession = inject(AuthSessionService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>('learner');
  readonly errorMessage = signal('');
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  readonly title = computed(() =>
    this.mode() === 'admin' ? 'Admin access' : 'Learner sign in',
  );

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.authSession
      .login(this.form.getRawValue(), this.mode())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(
            'Signed in',
            'Your workspace is ready.',
          );
          void this.router.navigate([this.authSession.ensureRoleRedirect()]);
        },
        error: (error) => {
          this.errorMessage.set(this.authSession.describeError(error));
        },
      });
  }
}
