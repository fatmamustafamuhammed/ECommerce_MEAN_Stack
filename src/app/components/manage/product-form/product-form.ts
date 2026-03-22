import { Component, OnInit, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { ProductService } from '../../../services/product';
import { CategoryService } from '../../../services/category';
import { ProductModel } from '../../../Models/product';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss'],
})
export class ProductForm implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private confirmService = inject(ConfirmDialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form state for all fields
  id = signal('');
  name = signal('');
  shortDescription = signal('');
  description = signal('');
  price = signal<number | null>(null);
  discount = signal<number | null>(null);
  images = signal<string[]>([]);
  categoryId = signal('');
  isFeatured = signal(false);
  isnew = signal(false);

  // UI state
  categories = signal<any[]>([]);
  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  newImageUrl = signal('');
  uploading = signal(false);

  ngOnInit(): void {
    this.loadCategories();

    const paramId = this.route.snapshot.params['id'];
    if (paramId) {
      this.id.set(paramId);
      this.isEdit.set(true);
      this.loadProduct();
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Error loading categories:', error),
    });
  }

  loadProduct(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProductById(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product: any) => {
          if (product) {
            this.name.set(product.name || '');
            this.shortDescription.set(product.shortDescription || '');
            this.description.set(product.description || '');
            this.price.set(product.price || null);
            this.discount.set(product.discount || null);
            this.images.set(product.images || []);
            this.categoryId.set(product.categoryId || '');
            this.isFeatured.set(product.isFeatured || false);
            this.isnew.set(product.isnew || false);
          } else {
            this.notification.error('Product not found');
            this.navigateBack();
          }
        },
        error: (error) => {
          this.error.set('Failed to load product');
          this.notification.error('Failed to load product');
          console.error('Error loading product:', error);
        },
      });
  }

  addImage(): void {
    if (this.newImageUrl() && this.newImageUrl().trim()) {
      const url = this.newImageUrl().trim();
      if (this.isValidUrl(url)) {
        this.images.update((current) => [...current, url]);
        this.newImageUrl.set('');
      } else {
        this.notification.error('Please enter a valid URL');
      }
    }
  }

  removeImage(index: number): void {
    this.images.update((current) => current.filter((_, i) => i !== index));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files.length === 0) return;

    this.uploading.set(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notification.error(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.notification.error(`${file.name} exceeds 5MB limit`);
        continue;
      }

      formData.append('images', file);
    }

    this.productService
      .uploadImages(formData)
      .pipe(
        finalize(() => {
          this.uploading.set(false);
          // Clear file input
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        }),
      )
      .subscribe({
        next: (response: any) => {
          // Assuming server returns array of image URLs
          const imageUrls = response.imageUrls || response;
          this.images.update((current) => [...current, ...imageUrls]);
          this.notification.success('Images uploaded successfully');
        },
        error: (error) => {
          this.notification.error('Failed to upload images');
          console.error('Upload error:', error);
        },
      });
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.submitting.set(true);
    this.error.set(null);

    const productData: ProductModel = {
      name: this.name(),
      shortDescription: this.shortDescription(),
      description: this.description(),
      price: this.price() ?? 0,
      discount: this.discount() ?? 0,
      images: this.images(),
      categoryId: this.categoryId(),
      isFeatured: this.isFeatured(),
      isnew: this.isnew(),
    };

    const action = this.isEdit()
      ? this.productService.updateProduct(this.id(), productData)
      : this.productService.addProduct(productData);

    action.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.notification.success(
          this.isEdit() ? 'Product updated successfully!' : 'Product added successfully!',
        );
        this.navigateBack();
      },
      error: (error) => {
        const message =
          error.error?.message ||
          (this.isEdit() ? 'Failed to update product' : 'Failed to add product');
        this.error.set(message);
        this.notification.error(message);
      },
    });
  }

  onCancel(): void {
    if (this.hasChanges()) {
      this.confirmService.discardConfirmation().subscribe((confirmed) => {
        if (confirmed) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  private hasChanges(): boolean {
    return !!(
      this.name() ||
      this.shortDescription() ||
      this.description() ||
      this.price() ||
      this.discount() ||
      this.images().length ||
      this.categoryId() ||
      this.isFeatured() ||
      this.isnew()
    );
  }

  private isValid(): boolean {
    if (!this.name()?.trim()) {
      this.notification.error('Product name is required');
      return false;
    }
    if (!this.description()?.trim()) {
      this.notification.error('Description is required');
      return false;
    }
    if (!this.price() || this.price()! < 0) {
      this.notification.error('Valid price is required');
      return false;
    }
    if (this.discount() && (this.discount()! < 0 || this.discount()! > 100)) {
      this.notification.error('Discount must be between 0 and 100');
      return false;
    }
    if (!this.categoryId()) {
      this.notification.error('Category is required');
      return false;
    }
    return true;
  }

  private navigateBack(): void {
    this.router.navigate(['/admin/products']);
  }

  // Helper methods for template
  getPageTitle(): string {
    if (this.loading()) return 'Loading...';
    return this.isEdit() ? 'Edit Product' : 'Add New Product';
  }

  getSubmitButtonText(): string {
    if (this.submitting()) {
      return this.isEdit() ? 'Updating...' : 'Adding...';
    }
    return this.isEdit() ? 'Update Product' : 'Add Product';
  }
}
