import { Header } from './components/header/header';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Footer } from './components/footer/footer';
import { wishListService } from './services/wishList';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('webapp');
  private wishListService = inject(wishListService);

  ngOnInit() {
    this.wishListService.init();
  }
}
