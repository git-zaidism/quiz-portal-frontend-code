import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly authSession = inject(AuthSessionService);
}
