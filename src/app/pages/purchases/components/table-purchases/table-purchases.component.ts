import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { GET_STATUS } from 'src/app/_helpers/tools/utils.tool';
import { UserService } from "src/app/_services/users.service";
import * as moment from 'moment';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';

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
  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter<boolean>();

  public isLoading: boolean = false;

  public users: [] = [];
  public trm: any

  public filterCode = new FormControl('');
  public filterOrderService = new FormControl('');
  public filterOrderServiceStatus = new FormControl(null);
  public filterDate = new FormControl('');
  public productName = new FormControl('');
  public purchaseNumber = new FormControl('');
  public filterUser = new FormControl('');
  public total_value = new FormControl('');
  public filterStatusProduct = new FormControl(null);
  public filterIdProduct = new FormControl('');

  public filteredUsers: Observable<string[]>;

  constructor(private _userService: UserService, private modalService: NgbModal, private _orderService: OrderService) { }

  ngOnInit(): void {
    this.getUsersAdmin();
    this.getTrm();
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  getUsersAdmin(): void {
    this._userService.getUsersAdmin()
      .subscribe((users: any) => {
        this.users = users;
      }, err => {
        throw err;
      });
  }

  getTrm(): void {
    this._orderService.getTRM()
      .subscribe((res: any) => {
        this.trm = res;
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
      return '';
    }
  }

  resetFilters() {
    this.filterCode.reset();
    this.filterOrderService.reset();
    this.filterOrderServiceStatus.reset();
    this.filterUser.reset();
    this.filterDate.reset();
    this.productName.reset();
    this.purchaseNumber.reset();
    this.filterStatusProduct.reset();
    this.filterIdProduct.reset();
    this.filterPurchase();
  }

  filterPurchase() {
    const filterValues = {};
    if (this.filterCode.value && this.filterCode.value.trim() != '') {
      filterValues['id'] = this.filterCode.value;
    }
    if (this.filterIdProduct.value && this.filterIdProduct.value.trim() != '') {
      filterValues['product_id'] = this.filterIdProduct.value;
    }
    if (this.filterOrderService.value && this.filterOrderService.value.trim() != '') {
      filterValues['order_service'] = this.filterOrderService.value;
    }
    if (this.filterOrderServiceStatus.value != null && this.filterOrderServiceStatus.value != 'null') {
      filterValues['order_service_status'] = this.filterOrderServiceStatus.value;
    }
    if (this.filterDate.value && this.filterDate.value.year.trim() != '') {
      filterValues['purchase_date'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    }
    if (this.filterUser.value != null && this.filterUser.value != '') {
      filterValues['user'] = this.filterUser.value.id;
    }
    if (this.productName.value != null && this.productName.value.trim() != '') {
      filterValues['product_name'] = this.productName.value;
    }
    if (this.purchaseNumber.value != null && this.purchaseNumber.value.trim() != '') {
      filterValues['invoice_number'] = this.purchaseNumber.value;
    }
    if (this.filterStatusProduct.value != null && this.filterStatusProduct.value != '') {
      filterValues['locker_has_product'] = this.filterStatusProduct.value;
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

  getStatus(status: string): string {
    return GET_STATUS(status);
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

  openLocker(content: any): void {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  closeModalReceive(event: any) {
    event.close();
  }

  refreshTableReceive(event: boolean) {
    this.refreshTable.emit(event);
  }

}

