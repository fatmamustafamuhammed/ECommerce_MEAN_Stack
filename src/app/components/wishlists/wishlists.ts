import { ProductCard } from '../product-card/product-card';
import { wishListService } from '../../services/wishList';
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-wishlists',
  standalone: true,
  imports: [ProductCard, CommonModule, RouterLink, MatProgressSpinner],
  templateUrl: './wishlists.html',
  styleUrl: './wishlists.scss',
})
export class Wishlists implements OnInit {
  wishListService = inject(wishListService);

  // Create a computed signal to get wishlist items
  wishlistItems = computed(() => this.wishListService.wishLists$());

  ngOnInit() {
    // Load wishlist when component initializes
    this.wishListService.init();
  }

  handleAddToCart(product: any) {
    console.log('Add to cart:', product);
    // Handle add to cart logic
  }
}
