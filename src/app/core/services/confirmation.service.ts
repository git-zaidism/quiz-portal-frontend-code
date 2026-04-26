import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

interface ConfirmationRequest extends Required<ConfirmationOptions> {
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  readonly current = signal<ConfirmationRequest | null>(null);

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.current.set({
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        tone: options.tone ?? 'default',
        resolve,
      });
    });
  }

  close(confirmed: boolean): void {
    const request = this.current();
    if (!request) {
      return;
    }

    this.current.set(null);
    request.resolve(confirmed);
  }
}
