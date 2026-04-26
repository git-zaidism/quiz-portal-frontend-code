import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models/api.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notifications = inject(NotificationService);
  private readonly httpError = inject(HttpErrorService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    categoryId: [0],
    title: ['', [Validators.required]],
    description: [''],
  });

  readonly editing = computed(() => this.form.controls.categoryId.value > 0);

  constructor() {
    this.loadCategories();
  }

  editCategory(category: Category): void {
    this.form.setValue({
      categoryId: category.categoryId,
      title: category.title,
      description: category.description ?? '',
    });
  }

  resetForm(): void {
    this.form.reset({
      categoryId: 0,
      title: '',
      description: '',
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const request = raw.categoryId
      ? this.categoryApi.update(raw)
      : this.categoryApi.create({
          title: raw.title,
          description: raw.description,
        });

    request.subscribe({
      next: () => {
        this.notifications.success(
          this.editing() ? 'Category updated' : 'Category created',
          'The category list has been refreshed.',
        );
        this.resetForm();
        this.loadCategories();
        this.saving.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to save category.'),
        );
        this.saving.set(false);
      },
    });
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: `Delete ${category.title}?`,
      message:
        'This removes the category from the catalog. Keep in mind that linked quiz data may block deletion on the backend.',
      confirmLabel: 'Delete category',
      cancelLabel: 'Keep category',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.categoryApi.delete(category.categoryId).subscribe({
      next: () => {
        this.notifications.info('Category deleted', `${category.title} was removed.`);
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to delete category.'),
        );
      },
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoryApi.getAll().subscribe({
      next: (categories) => {
        this.categories.set(
          [...categories].sort((left, right) => left.title.localeCompare(right.title)),
        );
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          this.httpError.getMessage(error, 'Unable to load categories.'),
        );
        this.loading.set(false);
      },
    });
  }
}
