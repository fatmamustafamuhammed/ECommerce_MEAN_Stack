import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

export interface TableConfig {
  columns: TableColumnConfig[];
  showFilter?: boolean;
  filterPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  showFirstLastButtons?: boolean;
  loading?: boolean;
  actions?: TableAction[];
  noDataMessage?: string;
}

export interface TableColumnConfig {
  name: string;
  property: string;
  sortable?: boolean;
  width?: string;
  cellTemplate?: 'text' | 'date' | 'currency' | 'custom' | 'boolean';
  format?: string;
  type?: 'text' | 'checkbox' | 'date' | 'currency' | 'custom';
  checkboxConfig?: {
    onChange: (item: any, value: boolean) => void;
    disabledCondition?: (item: any) => boolean;
  };
}

export interface TableAction {
  icon?: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  showCondition?: (element: any) => boolean;
  disabledCondition?: (element: any) => boolean;
  handler: (element: any) => void;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './reusable-table.html',
  styleUrls: ['./reusable-table.scss']
})
export class ReusableTable implements OnInit, AfterViewInit, OnChanges {
  @Input() data: any[] = [];
  @Input() config!: TableConfig;
  @Input() loading = false;
  @Input() deletingId: string | null = null;

  @Output() filterChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() refresh = new EventEmitter<void>();
  @Output() rowClick = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  filterValue = '';

  private liveAnnouncer = inject(LiveAnnouncer);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initColumns();
    this.setupDataSource();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }

      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        if (this.config.pageSizeOptions) {
          this.paginator.pageSizeOptions = this.config.pageSizeOptions;
        }
        this.paginator.pageSize = this.config.defaultPageSize || 5;
      }

      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = [...this.data];

      setTimeout(() => {
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.length = this.dataSource.filteredData.length;
        }
        this.cdr.detectChanges();
      });
    }
  }

  private setupDataSource(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = (data._id + data.name).toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    };

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case '_id':
          return item._id || '';
        case 'name':
          return item.name || '';
        default:
          return item[property] || '';
      }
    };
  }

  private initColumns(): void {
    this.displayedColumns = this.config.columns.map(col => col.property);
    if (this.config.actions?.length) {
      this.displayedColumns.push('actions');
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.filterChange.emit(filterValue);
  }

  clearFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
    this.filterChange.emit('');

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  announceSortChange(sortState: Sort): void {
    const message = sortState.direction ? `Sorted ${sortState.direction}ending` : 'Sorting cleared';
    this.liveAnnouncer.announce(message);
    this.sortChange.emit(sortState);

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onPageChange(event: any): void {
    console.log('Page changed:', event);
  }

  isDeleting(element: any): boolean {
    return this.deletingId === element._id;
  }

getCellValue(element: any, column: TableColumnConfig): any {
  const value = element[column.property];

  switch (column.cellTemplate) {
    case 'date':
      return value ? new Date(value).toLocaleDateString() : '';
    case 'currency':
      return value ? `$${Number(value).toFixed(2)}` : '';
    case 'boolean':
      // Return 'true' or 'false' for boolean values
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      return value || '';
    default:
      // Handle boolean values even without cellTemplate
      if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
      }
      return value || '';
  }
}

  onRowClick(element: any): void {
    this.rowClick.emit(element);
  }

  onActionClick(event: Event, action: TableAction, element: any): void {
    event.stopPropagation();
    if (!this.isActionDisabled(action, element)) {
      action.handler(element);
    }
  }

  isActionDisabled(action: TableAction, element: any): boolean {
    return action.disabledCondition ? action.disabledCondition(element) : false;
  }

  shouldShowAction(action: TableAction, element: any): boolean {
    return action.showCondition ? action.showCondition(element) : true;
  }

  getTotalItems(): number {
    return this.dataSource.filteredData.length;
  }

  getPageInfo(): string {
    if (!this.paginator || this.getTotalItems() === 0) {
      return '0 of 0';
    }

    const start = this.paginator.pageIndex * this.paginator.pageSize + 1;
    const end = Math.min(
      (this.paginator.pageIndex + 1) * this.paginator.pageSize,
      this.getTotalItems()
    );

    return `${start} - ${end} of ${this.getTotalItems()}`;
  }

  getTotalPages(): number {
    if (!this.paginator || this.dataSource.filteredData.length === 0) {
      return 0;
    }
    return Math.ceil(this.dataSource.filteredData.length / this.paginator.pageSize);
  }

  onCheckboxChange(element: any, column: any, value: boolean): void {
  if (column.checkboxConfig?.onChange) {
    column.checkboxConfig.onChange(element, value);
  }
}
}
