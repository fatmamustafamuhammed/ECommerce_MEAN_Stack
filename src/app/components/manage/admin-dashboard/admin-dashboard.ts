import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard {
  private router = inject(Router);

  goToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  goToBrands() {
    this.router.navigate(['/admin/brands']);
  }

  goToProducts() {
    this.router.navigate(['/admin/products']);
  }
}
