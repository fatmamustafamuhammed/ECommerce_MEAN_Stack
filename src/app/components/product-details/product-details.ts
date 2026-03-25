import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer';
import { ProductModel } from '../../Models/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  product!: ProductModel;
   selectedImage = 0;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.customerService.getProductById(id).subscribe((result) => {
      this.product = result;
      console.log(this.product);
    });
  }

  changeImage(index: number) {
    this.selectedImage = index;
  }
}
