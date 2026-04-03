import { CategoryModel } from '../../Models/category';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';
import { Component, inject, OnInit } from '@angular/core';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  currentYear: number = new Date().getFullYear();

  customerService = inject(CustomerService);
  authService = inject(AuthService);

  categoryList: CategoryModel[] = [];

  ngOnInit() {
    this.customerService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }
}
