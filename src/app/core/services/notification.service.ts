import { Injectable, signal } from '@angular/core';

export type NotificationTone = 'success' | 'error' | 'info';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  tone: NotificationTone;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly items = signal<NotificationItem[]>([]);
  private nextId = 1;

  success(title: string, message: string): void {
    this.push(title, message, 'success');
  }

  error(title: string, message: string): void {
    this.push(title, message, 'error');
  }

  info(title: string, message: string): void {
    this.push(title, message, 'info');
  }

  remove(id: number): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  private push(title: string, message: string, tone: NotificationTone): void {
    const id = this.nextId++;
    this.items.update((items) => [...items, { id, title, message, tone }]);
    window.setTimeout(() => this.remove(id), 4200);
  }
}
