import { Router, RouterLink } from '@angular/router';
import { CategoryModel } from '../../Models/category';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  customerService = inject(CustomerService);
  categoryList: CategoryModel[] = [];
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.customerService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }

  onSearchClick(e: any) {
    if (e.target.value) {
      this.router.navigateByUrl('/products?search=' + e.target.value);
    }
  }

  searchCategory(id: string) {
    this.router.navigateByUrl('/products?categoryId=' + id!);
  }

  onProfileClick() {
    console.log('Profile clicked');
    // Navigate to profile page
  }
  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
