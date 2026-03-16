import { CategoryService } from './../../../services/category';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule, MatInputModule, MatButtonModule, MatLabel],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm {
  name!: string;
  CategoryService = inject(CategoryService);
  router = inject(Router);
  add() {
    console.log(this.name);
    this.CategoryService.addCategory(this.name).subscribe((result: any) => {
      console.log('Category added.');
      this.router.navigateByUrl('/admin/categories');
    });
  }
}
