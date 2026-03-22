import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  categories: string[] = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Books',
    'Sports',
    'Toys',
    'Beauty',
  ];

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
