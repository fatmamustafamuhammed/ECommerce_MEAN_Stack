import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './customer-profile.html',
  styleUrls: ['./customer-profile.scss'],
})
export class CustomerProfile {
  authService = inject(AuthService);
}
