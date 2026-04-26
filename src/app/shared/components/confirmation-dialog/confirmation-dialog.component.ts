import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly confirmation = inject(ConfirmationService);

  confirm(): void {
    this.confirmation.close(true);
  }

  cancel(): void {
    this.confirmation.close(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmation.current()) {
      this.cancel();
    }
  }
}
