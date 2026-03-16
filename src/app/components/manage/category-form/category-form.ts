import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryForm implements OnInit {
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private confirmService = inject(ConfirmDialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form state
  name = signal('');
  id = signal('');
  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(true);
      this.loadCategory();
    }
  }

  public loadCategory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getCategoryById(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (category: any) => {
          if (category) {
            this.name.set(category.name);
          } else {
            this.notification.error('Category not found');
            this.navigateBack();
          }
        },
        error: (error) => {
          this.error.set('Failed to load category');
          this.notification.error('Failed to load category');
          console.error('Error loading category:', error);
        }
      });
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.submitting.set(true);
    this.error.set(null);

    const action = this.isEdit()
      ? this.categoryService.updateCategory(this.id(), this.name())
      : this.categoryService.addCategory(this.name());

    action.pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.success(
            this.isEdit() ? 'Category updated successfully!' : 'Category added successfully!'
          );
          this.navigateBack();
        },
        error: (error) => {
          const message = error.error?.message || (this.isEdit() ? 'Failed to update category' : 'Failed to add category');
          this.error.set(message);
          this.notification.error(message);
        }
      });
  }

  onCancel(): void {
    if (this.name() && this.name().trim()) {
      this.confirmService.discardConfirmation().subscribe((confirmed) => {
        if (confirmed) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  private isValid(): boolean {
    return this.name()?.trim()?.length > 0;
  }

  private navigateBack(): void {
    this.router.navigate(['/admin/categories']);
  }

  getPageTitle(): string {
    if (this.loading()) return 'Loading...';
    return this.isEdit() ? 'Edit Category' : 'Add New Category';
  }

  getSubmitButtonText(): string {
    if (this.submitting()) {
      return this.isEdit() ? 'Updating...' : 'Adding...';
    }
    return this.isEdit() ? 'Update Category' : 'Add Category';
  }
}
