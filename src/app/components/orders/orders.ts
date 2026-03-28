import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order';
import { Order } from '../../Models/order';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinner],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  orderService = inject(OrderService);
  
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedOrder = signal<Order | null>(null);
  
  // Computed values
  totalOrders = computed(() => this.orders().length);
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.orderService.getCustomerOrders().subscribe({
      next: (orders: Order[]) => {
        console.log('Orders loaded:', orders);
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading orders:', error);
        this.error.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
  
  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }
  
  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }
  
  // Add proper type checking
  getStatusColor(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Add proper type checking
  getStatusText(status: string | undefined): string {
    if (!status) return 'Unknown';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
  
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Safe access for order ID
  getOrderId(order: Order): string {
    return order._id || 'N/A';
  }

  calculateOrderTotal(order: Order): number {
  if (!order.items || order.items.length === 0) return 0;
  
  return order.items.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
}
}