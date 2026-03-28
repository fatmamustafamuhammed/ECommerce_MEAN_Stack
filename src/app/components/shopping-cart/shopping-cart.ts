import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { cartService } from '../../services/cart';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../Models/cart';
import { OrderService } from '../../services/order';
import { Order } from '../../Models/order';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatProgressSpinner],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart implements OnInit {
  cartService = inject(cartService);
  orderService = inject(OrderService);

  // Signals for state management
  orderStep = signal<number>(0);
  isSubmitting = signal<boolean>(false);

  // Checkout form data
  checkoutForm = signal({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash_on_delivery' as 'credit_card' | 'paypal' | 'cash_on_delivery',
  });

  // Computed signals
  cartItems = computed(() => this.cartService.cartItems$());
  cartTotal = computed(() => this.cartService.getCartTotal());
  totalItems = computed(() => this.cartService.getTotalItems());

  ngOnInit(): void {
    this.cartService.init();
  }

  // Quantity management
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item.product._id!);
    } else {
      this.cartService.updateQuantity(item.product._id!, item.quantity, newQuantity).subscribe({
        error: (err: Error) => console.error('Error updating quantity:', err),
        next: () => console.log('Quantity updated successfully'),
      });
    }
  }

  incrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity - 1);
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      this.updateQuantity(item, newQuantity);
    } else {
      input.value = item.quantity.toString();
    }
  }

  removeItem(productId: string): void {
    this.cartService.deleteCart(productId).subscribe({
      error: (err: Error) => console.error('Error removing item:', err),
      next: () => console.log('Item removed successfully'),
    });
  }

  clearError(): void {
    this.cartService.clearError();
  }

  handleCheckout(): void {
    console.log('Proceed to checkout');
    this.orderStep.set(1);
  }

  backToCart(): void {
    this.orderStep.set(0);
  }

  // Form validation helper
  isFormValid(): boolean {
    const form = this.checkoutForm();
    return !!(
      form.fullName &&
      form.email &&
      form.phone &&
      form.address &&
      form.city &&
      form.postalCode
    );
  }

  // Complete order method
  completeOrder(): void {
    if (!this.isFormValid()) {
      console.error('Please fill all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.checkoutForm();
    const items = this.cartItems();
    const total = this.cartTotal();

    // Create order object
    const order: Order = {
      items: items,
      paymentType: formData.paymentMethod,
      address: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      date: new Date(),
      totalAmount: total,
      status: 'pending',
    };

    console.log('Placing order:', order);

    // Send order to backend
    this.orderService.addOrder(order).subscribe({
      next: (result) => {
        console.log('Order placed successfully:', result);
        this.isSubmitting.set(false);
        this.orderStep.set(2);

        // Optional: Clear cart after successful order
        // this.clearCart();
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.isSubmitting.set(false);
        alert('Failed to place order. Please try again.');
      },
    });
  }

  placeOrder(): void {
    this.completeOrder();
  }

  // Update form field
  updateFormField(field: string, value: string): void {
    this.checkoutForm.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Clear cart after order (optional)
  clearCart(): void {
    // Clear all items from cart
    const items = this.cartItems();
    items.forEach((item) => {
      if (item.product._id) {
        this.cartService.deleteCart(item.product._id).subscribe();
      }
    });
  }
}
