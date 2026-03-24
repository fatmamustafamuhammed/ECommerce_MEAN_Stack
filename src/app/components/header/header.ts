import { Router, RouterLink } from '@angular/router';
import { CategoryModel } from '../../Models/category';
import { CategoryService } from './../../services/category';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  categoryService = inject(CategoryService);
  categoryList: CategoryModel[] = [];
  router = inject(Router);

  ngOnInit() {
    this.categoryService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }

  onSearch(e: any) {
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
}
