import { CategoryModel } from '../../Models/category';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';
import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  customerService = inject(CustomerService);
  categoryList: CategoryModel[] = [];
  authService = inject(AuthService);
  ngOnInit() {
    this.customerService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }
}
