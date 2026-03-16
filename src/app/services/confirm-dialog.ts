import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: data,
      width: '450px',
      disableClose: true,
      panelClass: 'confirm-dialog-panel',
    });

    return dialogRef.afterClosed();
  }

  deleteConfirmation(itemName: string, itemType: string = 'item'): Observable<boolean> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete this ${itemType}?`,
      itemName: itemName,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      showIcon: false,
      icon: 'warning',
    });
  }
}
