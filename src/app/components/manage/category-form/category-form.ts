import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule, MatInputModule, MatButtonModule, MatLabel],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  name = signal('');
  id = signal('');
  isEdit = signal(false);
  submitting = signal(false);

  ngOnInit() {
    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(true);
      this.loadCategory();
    }
  }

  private loadCategory() {
    this.categoryService
      .getCategoryById(this.id())
      .pipe(finalize(() => this.categoryService.setLoading(false)))
      .subscribe({
        next: (result: any) => {
          if (result) {
            this.name.set(result.name);
          } else {
            this.router.navigateByUrl('/admin/categories');
          }
        },
        error: () => {
          this.categoryService.setError('Failed to load category');
          this.router.navigateByUrl('/admin/categories');
        },
      });
  }

  onSubmit() {
    if (!this.name()?.trim()) return;

    this.submitting.set(true);
    this.categoryService.clearError();

    const action = this.isEdit()
      ? this.categoryService.updateCategory(this.id(), this.name())
      : this.categoryService.addCategory(this.name());

    action.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.snackBar.open(this.isEdit() ? 'Category Updated!' : 'Category Added!', 'Close', {
          duration: 5000,
        });
        this.router.navigateByUrl('/admin/categories');
      },
      error: () => {
        this.snackBar.open(this.isEdit() ? 'Failed to Update' : 'Failed to Add', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  onCancel() {
    this.router.navigateByUrl('/admin/categories');
  }
}
