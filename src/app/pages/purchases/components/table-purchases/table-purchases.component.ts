import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { UserService } from "src/app/_services/users.service";

@Component({
  selector: 'app-table-purchases',
  templateUrl: './table-purchases.component.html',
  styleUrls: ['./table-purchases.component.scss']
})
export class TablePurchasesComponent implements OnInit {

  @Input() public purchases: [] = [];
  @Input() public count: number = 0;
  @Output() public editPurchase: EventEmitter<any> = new EventEmitter<any>();
  @Output() public filterPaginator: EventEmitter<any> = new EventEmitter<any>();
  @Output() public filterValues: EventEmitter<any> = new EventEmitter<any>();


  public isLoading: boolean = false;

  public users: [] = [];

  public filterCode = new FormControl('');
  public filterDate = new FormControl('');
  public productName = new FormControl('');
  public purchaseNumber = new FormControl('');
  public filterUser = new FormControl('');
  public total_value = new FormControl('');

  public filteredUsers: Observable<string[]>;

  constructor(private _userService: UserService) { }

  ngOnInit(): void {
    this.getUsersAdmin();
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));

  }

  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(users => {
      this.users = users;
    }, err => {
      throw err;
    });
  }

  selectPurchase(purchase) {
    this.editPurchase.emit(purchase);
  }

  formatDate() {
    if (this.filterDate.value?.year) {
      return moment(new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)).format('YYYY/MM/DD')
    } else {
      return ''
    }
  }

  resetFilters() {
    this.filterCode.reset();
    this.filterUser.reset();
    this.filterDate.reset();
    this.productName.reset();
    this.purchaseNumber.reset();
    this.filterPurchase();
  }

  filterPurchase() {
    const filterValues: any = {};
    if (this.filterCode.value && this.filterCode.value != '') {
      filterValues['id'] = this.filterCode.value
    } if (this.filterDate.value && this.filterDate.value.year != '') {
      filterValues['purchase_date'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    } if (this.filterUser.value != null && this.filterUser.value != '') {
      filterValues['user'] = this.filterUser.value.id;
    } if (this.productName.value != null && this.productName.value != '') {
      filterValues['product_name'] = this.productName.value;
    } if (this.purchaseNumber.value != null && this.purchaseNumber.value != '') {
      filterValues['invoice_number'] = this.purchaseNumber.value;
    }
    this.filterValues.emit(filterValues);
  }

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
  }

  emitPage($event) {
    this.filterPaginator.emit($event)
  }

  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue));
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return this[array];
    }
  }

  private _normalizeValue(value: any, array: any): string {
    if (typeof value === 'object') {
      if (array === 'conveyors') {
        return value?.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value?.full_name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'address') {
        return value?.address.toLowerCase().replace(/\s/g, '');
      }
    } else {
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

}

