import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ReusableTable,
  TableAction,
  TableConfig,
} from '../../../Shared/Components/Table/reusable-table/reusable-table';
import { CategoryService } from '../../../services/category';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { CategoryModel } from '../../../Models/category';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReusableTable, MatButton],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);
  private confirmService = inject(ConfirmDialogService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  categories = signal<CategoryModel[]>([]);
  loading = signal(false);
  deletingId = signal<string | null>(null);

  tableConfig: TableConfig = {
    showFilter: true,
    filterPlaceholder: 'Search categories...',
    pageSizeOptions: [5, 10, 25, 50],
    defaultPageSize: 5,
    showFirstLastButtons: true,
    noDataMessage: 'No categories found',
    columns: [
      {
        name: 'ID',
        property: '_id',
        sortable: true,
        width: '250px',
      },
      {
        name: 'Name',
        property: 'name',
        sortable: true,
        width: '250px',
      },
    ],
    actions: this.getTableActions(),
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  private getTableActions(): TableAction[] {
    return [
      {
        icon: 'edit',
        label: 'Edit',
        color: 'primary',
        tooltip: 'Edit category',
        handler: (category: CategoryModel) => this.editCategory(category),
      },
      {
        icon: 'delete',
        label: 'Delete',
        color: 'warn',
        tooltip: 'Delete category',
        disabledCondition: (category: CategoryModel) => this.isDeleting(category),
        handler: (category: CategoryModel) => this.deleteCategory(category),
      },
    ];
  }

  loadCategories(): void {
    this.loading.set(true);

    this.categoryService
      .getCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (error) => {
          this.notification.error('Failed to load categories');
          console.error('Error loading categories:', error);
        },
      });
  }

  editCategory(category: CategoryModel): void {
    this.router.navigate(['/admin/categories', category._id]);
  }

  deleteCategory(category: CategoryModel): void {
    if (!category._id) return;

    this.confirmService.deleteConfirmation(category.name, 'category').subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(category._id!);
      }
    });
  }

  private performDelete(id: string): void {
    this.deletingId.set(id);

    this.categoryService
      .deleteCategoryById(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.notification.success('Category deleted successfully!');
          this.loadCategories();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete category';
          this.notification.error(message);
        },
      });
  }

  isDeleting(category: CategoryModel): boolean {
    return this.deletingId() === category._id;
  }

  onRowClick(category: CategoryModel): void {
    this.editCategory(category);
  }

  onAddNew(): void {
    this.router.navigate(['/admin/categories/add']);
  }
}
