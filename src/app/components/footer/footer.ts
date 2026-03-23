import { CategoryModel } from '../../Models/category';
import { CategoryService } from './../../services/category';
import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  categoryService = inject(CategoryService);
  categoryList: CategoryModel[] = [];
  ngOnInit() {
    this.categoryService.getCategories().subscribe((result) => {
      this.categoryList = result;
    });
  }
}
