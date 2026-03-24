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
import { finalize, catchError, of } from 'rxjs';
import { NotificationService } from '../../../Shared/Services/notification-service';
import { ConfirmDialogService } from '../../../Shared/Services/confirm-dialog-service';
import { ProductService } from '../../../services/product';
import { CategoryService } from '../../../services/category';
import { ProductModel } from '../../../Models/product';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
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

  // Separate storage for images
  existingImages = signal<string[]>([]);
  newImagePreviews = signal<string[]>([]);
  localImageFiles = signal<File[]>([]);
  deletedImages = signal<string[]>([]);

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
            this.existingImages.set(product.images || []);
            this.categoryId.set(product.categoryId || '');
            this.isFeatured.set(product.isFeatured || false);
            this.isnew.set(product.isnew || false);

            this.deletedImages.set([]);
            this.updateDisplayImages();

            console.log('Loaded product with images:', this.existingImages());
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
        this.existingImages.update((current) => [...current, url]);
        this.updateDisplayImages();
        this.newImageUrl.set('');
      } else {
        this.notification.error('Please enter a valid URL');
      }
    }
  }

  removeImage(index: number): void {
    console.log('Removing image at index:', index);

    if (index < this.existingImages().length) {
      const imageToDelete = this.existingImages()[index];
      console.log('Deleting existing image:', imageToDelete);

      if (this.isEdit() && this.id()) {
        this.deletedImages.update((current) => [...current, imageToDelete]);
        this.notification.info('Image will be deleted when you save');
        console.log('Marked for deletion:', imageToDelete);
      }

      this.existingImages.update((current) => current.filter((_, i) => i !== index));
    } else {
      const newIndex = index - this.existingImages().length;
      console.log('Removing new image preview at index:', newIndex);
      this.newImagePreviews.update((current) => current.filter((_, i) => i !== newIndex));
      this.localImageFiles.update((current) => current.filter((_, i) => i !== newIndex));
    }

    this.updateDisplayImages();
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        this.notification.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.notification.error(`${file.name} exceeds 5MB limit`);
        continue;
      }

      this.localImageFiles.update((current) => [...current, file]);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.newImagePreviews.update((current) => [...current, e.target?.result as string]);
        this.updateDisplayImages();
      };
      reader.readAsDataURL(file);
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private updateDisplayImages(): void {
    this.images.set([...this.existingImages(), ...this.newImagePreviews()]);
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.submitting.set(true);
    this.error.set(null);

    try {
      console.log('Starting submit process...');
      console.log('Existing images:', this.existingImages());
      console.log('New files to upload:', this.localImageFiles().length);
      console.log('Images marked for deletion:', this.deletedImages());

      // Step 1: Upload new images first (if any)
      let uploadedImageUrls: string[] = [];
      if (this.localImageFiles().length > 0) {
        console.log('Uploading new images...');
        uploadedImageUrls = await this.uploadImagesBeforeSubmit();
        console.log('Uploaded images:', uploadedImageUrls);
      }

      // Step 2: Prepare final images list
      const finalImages = [...this.existingImages(), ...uploadedImageUrls];
      console.log('Final images to save:', finalImages);

      // Step 3: Save product
      console.log('Saving product...');
      await this.saveProduct(finalImages);
      console.log('Product saved successfully');

      // Step 4: Delete marked images after product is saved
      if (this.isEdit() && this.deletedImages().length > 0) {
        console.log('Deleting marked images...');
        await this.deleteMarkedImages();
        console.log('Images deleted successfully');
      }

      this.notification.success(
        this.isEdit() ? 'Product updated successfully!' : 'Product added successfully!',
      );
      this.navigateBack();
    } catch (error) {
      console.error('Error in submit process:', error);
      this.submitting.set(false);
      this.notification.error('Failed to process product');
    }
  }

  private async uploadImagesBeforeSubmit(): Promise<string[]> {
    const formData = new FormData();

    this.localImageFiles().forEach((file) => {
      formData.append('images', file);
    });

    return new Promise((resolve, reject) => {
      this.productService.uploadImages(formData).subscribe({
        next: (response: any) => {
          const newImageUrls = response.imageUrls || response;
          resolve(newImageUrls);
        },
        error: (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
      });
    });
  }

  private async deleteMarkedImages(): Promise<void> {
    const productId = this.id();
    console.log('Deleting images for product ID:', productId);

    for (const imageUrl of this.deletedImages()) {
      console.log('Attempting to delete image:', imageUrl);
      try {
        const result = await this.productService
          .deleteImage(productId, imageUrl)
          .pipe(
            catchError((error) => {
              console.error(`Failed to delete image: ${imageUrl}`, error);
              return of(null);
            }),
          )
          .toPromise();

        console.log('Delete result:', result);
      } catch (error) {
        console.error(`Error deleting image ${imageUrl}:`, error);
      }
    }

    console.log('All deletions attempted');
    this.deletedImages.set([]);
  }

  private async saveProduct(images: string[]): Promise<void> {
    const productData: ProductModel = {
      name: this.name(),
      shortDescription: this.shortDescription(),
      description: this.description(),
      price: this.price() ?? 0,
      discount: this.discount() ?? 0,
      images: images,
      categoryId: this.categoryId(),
      isFeatured: this.isFeatured(),
      isnew: this.isnew(),
    };

    const action = this.isEdit()
      ? this.productService.updateProduct(this.id(), productData)
      : this.productService.addProduct(productData);

    return new Promise((resolve, reject) => {
      action.subscribe({
        next: (response: any) => {
          console.log('Save response:', response);
          if (!this.isEdit() && response && response._id) {
            this.id.set(response._id);
            this.isEdit.set(true);
            console.log('New product ID set:', response._id);
          }
          resolve(response);
        },
        error: (error) => {
          console.error('Save error:', error);
          reject(error);
        },
      });
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
      this.isnew() ||
      this.deletedImages().length > 0 ||
      this.localImageFiles().length > 0
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

  async testDeleteImage(): Promise<void> {
    if (this.deletedImages().length > 0) {
      console.log('Testing delete for:', this.deletedImages());
      for (const imageUrl of this.deletedImages()) {
        try {
          const result = await this.productService.deleteImage(this.id(), imageUrl).toPromise();
          console.log('Delete result:', result);
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    } else {
      console.log('No images marked for deletion');
    }
  }
}
