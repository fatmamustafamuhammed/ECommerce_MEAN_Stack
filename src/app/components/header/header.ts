import { Router, RouterLink } from '@angular/router';
import { CategoryModel } from '../../Models/category';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BrandService } from '../../services/brand';
import { BrandModel } from '../../Models/brand';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  customerService = inject(CustomerService);
  brandService = inject(BrandService);
  categoryList: CategoryModel[] = [];
  brandList: BrandModel[] = [];
  authService = inject(AuthService);
  router = inject(Router);

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.customerService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });

    this.customerService.getBrands().subscribe((result) => {
      this.brandList = result;
    });

    // Setup search with debounce
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchTerm) => {
      if (searchTerm && searchTerm.trim()) {
        this.performSearch(searchTerm.trim());
      } else if (searchTerm === '') {
        this.router.navigate(['/products']);
      }
    });
  }

  onSearchInput(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  onSearchClick(searchTerm: string) {
    // For enter key, search immediately (clear debounce)
    if (searchTerm && searchTerm.trim()) {
      this.performSearch(searchTerm.trim());
    }
  }

  private performSearch(searchTerm: string) {
    this.router.navigate(['/products'], {
      queryParams: { search: searchTerm },
    });
  }

  searchCategory(id: string) {
    this.router.navigate(['/products'], {
      queryParams: { categoryId: id },
    });
  }

  searchbrand(id: string) {
    this.router.navigate(['/products'], {
      queryParams: { brandId: id },
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
