import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ReusableTable,
  TableAction,
  TableConfig,
} from '../../../Shared/Components/Table/reusable-table/reusable-table';
import { ProductService } from '../../../services/product';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { ProductModel } from '../../../Models/product';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReusableTable, MatButton],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private confirmService = inject(ConfirmDialogService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  products = signal<ProductModel[]>([]);
  loading = signal(false);
  deletingId = signal<string | null>(null);

  tableConfig: TableConfig = {
    showFilter: true,
    filterPlaceholder: 'Search products...',
    pageSizeOptions: [5, 10, 25, 50],
    defaultPageSize: 5,
    showFirstLastButtons: true,
    noDataMessage: 'No products found',
    columns: [
      {
        name: 'ID',
        property: '_id',
        sortable: true,
        width: '200px',
      },
      {
        name: 'Name',
        property: 'name',
        sortable: true,
        width: '200px',
      },
      {
        name: 'Short Description',
        property: 'shortDescription',
        sortable: true,
        width: '200px',
      },
      {
        name: 'Price',
        property: 'price',
        sortable: true,
        width: '200px',
      },
      {
        name: 'Discount',
        property: 'discount',
        sortable: true,
        width: '200px',
      },
      {
        name: 'isFeatured',
        property: 'isFeatured',
        sortable: true,
        width: '100px',
      },
      {
        name: 'isNew',
        property: 'isnew',
        sortable: true,
        width: '100px',
      },
    ],
    actions: this.getTableActions(),
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  private getTableActions(): TableAction[] {
    return [
      {
        icon: 'edit',
        label: 'Edit',
        color: 'primary',
        tooltip: 'Edit product',
        handler: (product: ProductModel) => this.editProduct(product),
      },
      {
        icon: 'delete',
        label: 'Delete',
        color: 'warn',
        tooltip: 'Delete product',
        disabledCondition: (product: ProductModel) => this.isDeleting(product),
        handler: (product: ProductModel) => this.deleteProduct(product),
      },
    ];
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService
      .getProducts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: (error) => {
          this.notification.error('Failed to load products');
          console.error('Error loading products:', error);
        },
      });
  }

  editProduct(product: ProductModel): void {
    this.router.navigate(['/admin/products', product._id]);
  }

  deleteProduct(product: ProductModel): void {
    if (!product._id) return;

    this.confirmService.deleteConfirmation(product.name, 'product').subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(product._id!);
      }
    });
  }

  private performDelete(id: string): void {
    this.deletingId.set(id);

    // Note: The backend will handle deleting images automatically now
    this.productService
      .deleteProductById(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.notification.success('Product and its images deleted successfully!');
          this.loadProducts();
        },
        error: (error) => {
          const message = error.error?.message || 'Failed to delete product';
          this.notification.error(message);
        },
      });
  }

  isDeleting(product: ProductModel): boolean {
    return this.deletingId() === product._id;
  }

  onRowClick(product: ProductModel): void {
    this.editProduct(product);
  }

  onAddNew(): void {
    this.router.navigate(['/admin/products/add']);
  }
}
