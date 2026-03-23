import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input() product: any;
  @Output() addToCart = new EventEmitter<any>();

  private readonly DEFAULT_IMAGE = 'assets/images/default-product.png';

  getProductImage(): string {
    if (!this.product?.images) {
      return this.DEFAULT_IMAGE;
    }

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
}
