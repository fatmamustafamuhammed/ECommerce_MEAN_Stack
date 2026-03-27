import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem, cartService } from '../../services/cart';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart implements OnInit {
  cartService = inject(cartService);

  cartItems = computed(() => this.cartService.cartItems$());
  cartTotal = computed(() => this.cartService.getCartTotal());
  totalItems = computed(() => this.cartService.getTotalItems());

  ngOnInit() {
    this.cartService.init();
  }

  incrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    this.cartService.updateQuantity(item.product._id!, item.quantity, newQuantity).subscribe({
      error: (err) => console.error('Error incrementing quantity:', err),
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item.product._id!);
    } else {
      const newQuantity = item.quantity - 1;
      this.cartService.updateQuantity(item.product._id!, item.quantity, newQuantity).subscribe({
        error: (err) => console.error('Error decrementing quantity:', err),
      });
    }
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);

    if (!isNaN(newQuantity)) {
      if (newQuantity <= 0) {
        this.removeItem(item.product._id!);
      } else {
        this.cartService.updateQuantity(item.product._id!, item.quantity, newQuantity).subscribe({
          error: (err) => console.error('Error updating quantity:', err),
        });
      }
    } else {
      input.value = item.quantity.toString();
    }
  }

  removeItem(productId: string): void {
    this.cartService.deleteCart(productId).subscribe({
      error: (err) => console.error('Error removing item:', err),
    });
  }

  clearError(): void {
    this.cartService.clearError();
  }

  handleCheckout(): void {
    console.log('Proceed to checkout');
  }
}
