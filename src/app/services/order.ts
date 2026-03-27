import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Order } from '../Models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  addOrder(order: Order) {
    return this.http.post(`${this.baseUrl}/customer/order`, order);
  }

  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/customer/order/get`);
  }

  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

   updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/orders/${orderId}/status`, { status });
  }
}
