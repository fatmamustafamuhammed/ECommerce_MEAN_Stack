import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../Components/confirm-dialog/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data,
      width: '450px',
      disableClose: true,
      autoFocus: true
    });

    return dialogRef.afterClosed();
  }

  deleteConfirmation(itemName: string, itemType: string = 'item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${itemType}?`,
      itemName,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      showIcon: true,
      icon: 'delete'
    });
  }

  saveConfirmation(itemName?: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Save',
      message: 'Do you want to save these changes?',
      itemName,
      confirmText: 'Save',
      cancelText: 'Cancel',
      confirmColor: 'primary',
      showIcon: true,
      icon: 'save'
    });
  }

  discardConfirmation(): Observable<boolean> {
    return this.confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Are you sure you want to leave?',
      confirmText: 'Discard',
      cancelText: 'Stay',
      confirmColor: 'warn',
      showIcon: true,
      icon: 'exit_to_app'
    });
  }
}
