import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ReusableTable,
  TableAction,
  TableConfig,
} from '../../../Shared/Components/Table/reusable-table/reusable-table';
import { BrandService } from '../../../services/brand';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { BrandModel } from '../../../Models/brand';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, ReusableTable, MatButton],
  templateUrl: './brands.html',
  styleUrls: ['./brands.scss'],
})
export class Brands implements OnInit {
  private brandService = inject(BrandService);
  private confirmService = inject(ConfirmDialogService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  brands = signal<BrandModel[]>([]);
  loading = signal(false);
  deletingId = signal<string | null>(null);

  tableConfig: TableConfig = {
    showFilter: true,
    filterPlaceholder: 'Search brands...',
    pageSizeOptions: [5, 10, 25, 50],
    defaultPageSize: 5,
    showFirstLastButtons: true,
    noDataMessage: 'No brands found',
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
    this.loadBrands();
  }

  private getTableActions(): TableAction[] {
    return [
      {
        icon: 'edit',
        label: 'Edit',
        color: 'primary',
        tooltip: 'Edit brand',
        handler: (brand: BrandModel) => this.editBrand(brand),
      },
      {
        icon: 'delete',
        label: 'Delete',
        color: 'warn',
        tooltip: 'Delete brand',
        disabledCondition: (brand: BrandModel) => this.isDeleting(brand),
        handler: (brand: BrandModel) => this.deleteBrand(brand),
      },
    ];
  }

  loadBrands(): void {
    this.loading.set(true);

    this.brandService
      .getBrands()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brands) => {
          this.brands.set(brands);
        },
        error: (error) => {
          this.notification.error('Failed to load brands');
          console.error('Error loading brands:', error);
        },
      });
  }

  editBrand(brand: BrandModel): void {
    this.router.navigate(['/admin/brands', brand._id]);
  }

  deleteBrand(brand: BrandModel): void {
    if (!brand._id) return;

    this.confirmService.deleteConfirmation(brand.name, 'brand').subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(brand._id!);
      }
    });
  }

  private performDelete(id: string): void {
    this.deletingId.set(id);

    this.brandService
      .deleteBrandById(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.notification.success('Brand deleted successfully!');
          this.loadBrands();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete brand';
          this.notification.error(message);
        },
      });
  }

  isDeleting(brand: BrandModel): boolean {
    return this.deletingId() === brand._id;
  }

  onRowClick(brand: BrandModel): void {
    this.editBrand(brand);
  }

  onAddNew(): void {
    this.router.navigate(['/admin/brands/add']);
  }
}
