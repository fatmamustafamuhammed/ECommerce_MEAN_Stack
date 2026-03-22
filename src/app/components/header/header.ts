import { CategoryModel } from '../../Models/category';
import { CategoryService } from './../../services/category';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  categoryService = inject(CategoryService);
  categoryList: CategoryModel[] = [];
  ngOnInit() {
    this.categoryService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }

  searchQuery: string = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality here
    }
  }

  onProfileClick() {
    console.log('Profile clicked');
    // Navigate to profile page
  }

  onLogoClick() {
    console.log('Logo clicked');
    // Navigate to home page
  }
}
