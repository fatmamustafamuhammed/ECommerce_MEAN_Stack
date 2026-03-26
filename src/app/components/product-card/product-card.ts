import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductModel } from '../../Models/product';
import { wishListService } from '../../services/wishList';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input() product: any;
  @Output() addToCart = new EventEmitter<any>();
  wishListService = inject(wishListService);

  private readonly DEFAULT_IMAGE = 'assets/images/default-product.png';

  isInWishList = computed(() => {
    if (!this.product?._id) return false;
    return this.wishListService.wishLists$().some((x) => x._id === this.product._id);
  });

  getProductImage(): string {
    if (!this.product?.images) return this.DEFAULT_IMAGE;
    if (Array.isArray(this.product.images)) {
      const validImage = this.product.images.find((img: any) => img && typeof img === 'string');
      return validImage || this.DEFAULT_IMAGE;
    }
    if (typeof this.product.images === 'string' && this.product.images.trim()) {
      return this.product.images;
    }
    return this.DEFAULT_IMAGE;
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  onImageError(event: any): void {
    event.target.src = this.DEFAULT_IMAGE;
  }

  addToWishList(product: ProductModel) {
    if (!product._id) return;
    this.wishListService.toggleWishList(product).subscribe({
      error: (error) => console.error('Wishlist toggle error:', error),
    });
  }
}
