import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';
import { ProductCard } from '../product-card/product-card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit, OnDestroy {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  product!: ProductModel;
  selectedImage = 0;
  similarProducts: ProductModel[] = [];
  bannerImages: ProductModel[] = [];
  isLoading = false;
  isLoadingSimilar = false;

  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const id = params['id'];
        if (id) {
          console.log('Loading product with id:', id);
          this.loadProduct(id);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadProduct(id: string) {
    this.isLoading = true;

    this.customerService.getProductById(id).subscribe({
      next: (result) => {
        this.product = result;
        console.log('Product loaded:', this.product);
        this.selectedImage = 0;
        this.isLoading = false;

        this.loadSimilarProducts();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      },
    });
  }

  loadSimilarProducts() {
    if (!this.product?.categoryId) {
      console.warn('No categoryId available');
      return;
    }

    this.isLoadingSimilar = true;

    this.customerService.getProducts('', this.product.categoryId, '', -1, '', 1, 10).subscribe({
      next: (result) => {
        this.similarProducts = result.filter((p) => p._id !== this.product._id);
        console.log('Similar products:', this.similarProducts);
        this.bannerImages = [...this.similarProducts];
        this.isLoadingSimilar = false;
      },
      error: (error) => {
        console.error('Error loading similar products:', error);
        this.isLoadingSimilar = false;
        this.similarProducts = [];
      },
    });
  }

  changeImage(index: number) {
    this.selectedImage = index;
  }

  handleAddToCart(product: any): void {
    console.log('Adding to cart:', product);
    // this.cartService.addToCart(product);
  }
}
