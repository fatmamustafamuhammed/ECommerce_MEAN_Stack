import { AuthService } from './../../services/auth';
import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';
import { ProductCard } from '../product-card/product-card';
import { Subscription } from 'rxjs';
import { wishListService } from '../../services/wishList';
import { cartService } from '../../services/cart';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductCard, MatIconModule, MatProgressSpinner],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit, OnDestroy {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  wishListService = inject(wishListService);
  cartService = inject(cartService);
  authService = inject(AuthService);

  product = signal<ProductModel | null>(null);
  selectedImage = 0;
  similarProducts: ProductModel[] = [];
  isLoading = false;
  isLoadingSimilar = false;

  isInWishList = computed(() => {
    const p = this.product();
    if (!p?._id) return false;
    return this.wishListService.wishLists$().some((x) => x._id === p._id);
  });

  isInCart = computed(() => {
    const p = this.product();
    if (!p?._id) return false;
    return this.cartService.carts$().some((x) => x._id === p._id);
  });

  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        const id = params['id'];
        if (id) this.loadProduct(id);
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
        this.product.set(result);
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
    const p = this.product();
    if (!p?.categoryId) return;
    this.isLoadingSimilar = true;
    this.customerService.getProducts('', p.categoryId, '', -1, '', 1, 10).subscribe({
      next: (result) => {
        this.similarProducts = result.filter((x) => x._id !== p._id);
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

  toggleCart(): void {
    const currentProduct = this.product();
    if (!currentProduct?._id) return;

    if (this.isInCart()) {
      this.cartService.deleteCart(currentProduct._id).subscribe({
        error: (error) => {
          console.error('Remove from cart error:', error);
        },
        next: (response) => {
          console.log('Product removed from cart:', response);
        },
      });
    } else {
      this.cartService.addToCart(currentProduct, 1).subscribe({
        error: (error) => {
          console.error('Add to cart error:', error);
        },
        next: (response) => {
          console.log('Product added to cart:', response);
        },
      });
    }
  }

  handleAddToCart(product: any): void {
    console.log('Adding to cart:', product);
  }

  addToWishList(product: ProductModel) {
    if (!product._id) return;
    this.wishListService.toggleWishList(product).subscribe({
      error: (error) => console.error('Wishlist toggle error:', error),
    });
  }
}
