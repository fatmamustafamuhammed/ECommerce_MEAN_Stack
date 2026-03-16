import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// Angular Material
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LiveAnnouncer } from '@angular/cdk/a11y';

// Services & Models
import { CategoryService } from '../../../services/category';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { CategoryModel } from '../../../Models/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class Categories implements OnInit, AfterViewInit {
  private liveAnnouncer = inject(LiveAnnouncer);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private confirmService = inject(ConfirmDialogService);

  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<CategoryModel>([]);
  deletingId = '';
  filterValue = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
      },
      error: () => {
        this.showNotification('Failed to load categories', 'error');
      },
    });
  }

  applyFilter(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }

  clearFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
  }

  announceSortChange(sortState: Sort): void {
    const message = sortState.direction ? `Sorted ${sortState.direction}ending` : 'Sorting cleared';
    this.liveAnnouncer.announce(message);
  }

  deleteCategory(category: CategoryModel): void {
    if (!category._id) return;

    this.confirmService.deleteConfirmation(category.name, 'category').subscribe((result) => {
      if (result) {
        this.performDelete(category._id!);
      }
    });
  }

  private performDelete(id: string): void {
    this.deletingId = id;

    this.categoryService
      .deleteCategoryById(id)
      .pipe(
        finalize(() => {
          this.deletingId = '';
        }),
      )
      .subscribe({
        next: () => {
          this.showNotification('Category deleted successfully!', 'success');
          this.loadCategories();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete category';
          this.showNotification(message, 'error');
        },
      });
  }

  isDeleting(id: string): boolean {
    return this.deletingId === id;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
