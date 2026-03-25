import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterStateService {
  private clearFiltersSubject = new BehaviorSubject<boolean>(false);
  clearFilters$ = this.clearFiltersSubject.asObservable();

  clearAllFilters() {
    this.clearFiltersSubject.next(true);
  }
}
