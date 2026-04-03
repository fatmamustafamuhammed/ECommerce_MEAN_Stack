import { Router, RouterLink } from '@angular/router';
import { CategoryModel } from '../../Models/category';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CustomerService } from '../../services/customer';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BrandService } from '../../services/brand';
import { BrandModel } from '../../Models/brand';
import { FilterStateService } from '../../Shared/Services/Filter-State-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  customerService = inject(CustomerService);
  brandService = inject(BrandService);
  authService = inject(AuthService);
  router = inject(Router);
  filterStateService = inject(FilterStateService);
  private cdr = inject(ChangeDetectorRef);

  categoryList: CategoryModel[] = [];
  brandList: BrandModel[] = [];

  private searchSubject = new Subject<string>();
  private authSubscription = new Subscription();

  isLoggedIn = false;

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;

      if (isLoggedIn) {
        this.loadCategoriesAndBrands();
      }

      this.cdr.detectChanges();
    });

    this.searchSubject.pipe(debounceTime(2000), distinctUntilChanged()).subscribe((searchTerm) => {
      if (searchTerm && searchTerm.trim()) {
        this.performSearch(searchTerm.trim());
      } else if (searchTerm === '') {
        this.router.navigate(['/products']);
      }
    });
  }

  private loadCategoriesAndBrands() {
    forkJoin({
      categories: this.customerService.getCategories(),
      brands: this.customerService.getBrands(),
    }).subscribe({
      next: (result) => {
        this.categoryList = result.categories;
        this.brandList = result.brands;
        this.cdr.detectChanges();
        console.log('Categories and brands loaded after login');
      },
      error: (error) => {
        console.error('Error loading categories/brands:', error);
      },
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onSearchInput(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  onSearchClick(searchTerm: string) {
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

  clearAllFilters() {
    console.log('Header: Clearing all filters');
    this.filterStateService.clearAllFilters();
    this.router.navigate(['/products'], {
      queryParams: {},
      queryParamsHandling: '',
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
