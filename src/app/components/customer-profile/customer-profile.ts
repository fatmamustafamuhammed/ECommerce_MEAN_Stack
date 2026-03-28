import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { MatIconModule } from '@angular/material/icon';

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
