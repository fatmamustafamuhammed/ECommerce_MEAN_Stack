import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order';
import { Order } from '../../../Models/order';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrders implements OnInit {
  orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedOrder = signal<Order | null>(null);
  updatingOrderId = signal<string | null>(null);

  totalOrders = computed(() => {
    const ordersList = this.orders();
    return Array.isArray(ordersList) ? ordersList.length : 0;
  });

  totalRevenue = computed(() => {
    const ordersList = this.orders();
    if (!Array.isArray(ordersList) || ordersList.length === 0) return 0;

    return ordersList.reduce((sum: number, order: Order) => {
      return sum + (order.totalAmount || 0);
    }, 0);
  });

  pendingOrders = computed(() => {
    const ordersList = this.orders();
    if (!Array.isArray(ordersList)) return 0;

    return ordersList.filter((o: Order) => o.status === 'pending').length;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    console.log('Loading admin orders...');

    this.orderService.getAdminOrders().subscribe({
      next: (orders: Order[]) => {
        console.log('Admin orders loaded:', orders);
        this.orders.set(Array.isArray(orders) ? orders : []);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading orders:', error);
        this.error.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
        this.orders.set([]);
      },
    });
  }

  updateOrderStatus(order: Order, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;

    if (order.status === newStatus) {
      return;
    }

    this.updatingOrderId.set(order._id!);
    console.log(`Updating order ${order._id} to status: ${newStatus}`);

    this.orderService.updateOrderStatus(order._id!, newStatus).subscribe({
      next: (updatedOrder) => {
        console.log('Order status updated successfully:', updatedOrder);

        this.orders.update((currentOrders) =>
          currentOrders.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o)),
        );

        this.updatingOrderId.set(null);
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
        this.updatingOrderId.set(null);

        this.loadOrders();
      },
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

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
      minute: '2-digit',
    });
  }

  getOrderId(order: Order): string {
    return order._id || 'N/A';
  }

  calculateOrderTotal(order: Order): number {
    if (!order.items || order.items.length === 0) return 0;

    return order.items.reduce((total: number, item: any) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  }

  getUserId(order: any): string {
    return (order as any).userId || 'N/A';
  }

  isUpdating(orderId: string): boolean {
    return this.updatingOrderId() === orderId;
  }
}
