import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';
import { ProductCard } from '../product-card/product-card';
import { Subscription } from 'rxjs';
import { wishListService } from '../../services/wishList';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductCard, MatIconModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit, OnDestroy {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  wishListService = inject(wishListService);

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
