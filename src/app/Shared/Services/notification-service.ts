import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.show(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
      ...config
    });
  }

  error(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.show(message, action, {
      ...this.defaultConfig,
      panelClass: ['error-snackbar'],
      ...config
    });
  }

  info(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.show(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar'],
      ...config
    });
  }

  warning(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.show(message, action, {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar'],
      ...config
    });
  }

  private show(message: string, action: string, config: MatSnackBarConfig): void {
    this.snackBar.open(message, action, config);
  }
}
