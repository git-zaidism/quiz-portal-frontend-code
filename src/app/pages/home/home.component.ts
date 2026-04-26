import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly authSession = inject(AuthSessionService);

  readonly primaryRoute = computed(() =>
    this.authSession.isLoggedIn()
      ? this.authSession.ensureRoleRedirect()
      : '/login',
  );

  readonly primaryLabel = computed(() =>
    this.authSession.isLoggedIn() ? 'Open workspace' : 'Sign in',
  );
}
