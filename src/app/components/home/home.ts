import { ProductModel } from './../../Models/product';
import { Component, inject } from '@angular/core';
import { CustomerService } from '../../services/customer';
import { ProductCard } from '../product-card/product-card';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
// import { wishListService } from '../../services/wishList';

@Component({
  selector: 'app-home',
  imports: [ProductCard, CarouselModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    nav: true,
  };
  customerService = inject(CustomerService);
  // wishListService = inject(wishListService);
  newProducts: ProductModel[] = [];
  featuredProducts: ProductModel[] = [];
  categories: any[] = [];
  bannerImages: ProductModel[] = [];

  ngOnInit() {
    this.customerService.getFeaturedProducts().subscribe((result) => {
      this.featuredProducts = result;
      console.log(this.featuredProducts);
      this.bannerImages.push(...result);
    });

    this.customerService.getNewProducts().subscribe((result) => {
      this.newProducts = result;
      console.log(this.newProducts);
      this.bannerImages.push(...result);
    });

    this.customerService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });

    // this.wishListService.init();
  }

  handleAddToCart(product: any): void {
    console.log('Adding to cart:', product);
    //  this.cartService.addToCart(product);
  }
}
