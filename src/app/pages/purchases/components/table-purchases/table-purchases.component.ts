import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, startWith } from 'rxjs/operators';
import { GET_STATUS } from 'src/app/_helpers/tools/utils.tool';
import { UserService } from "src/app/_services/users.service";
import * as moment from 'moment';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { PurchasesService } from '../../_services/purchases.service';

import { Observable } from 'rxjs';
import Swal from 'sweetalert2';


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
  public isAndroid: boolean = false;

  public users: [] = [];
  public stores: any[] = [];
  public conveyors: any = [];
  public trm: any

  public filterCode = new FormControl('');
  public filterOrderService = new FormControl('');
  public filterOrderServiceStatus = new FormControl(null);
  public filterDate = new FormControl('');
  public filterLockerDate = new FormControl('');
  public productName = new FormControl('');
  public filterStore = new FormControl(null);
  public purchaseNumber = new FormControl('');
  public filterUser = new FormControl('');
  public total_value = new FormControl('');
  public filterStatusProduct = new FormControl(null);
  public filterIdProduct = new FormControl('');

  public filteredUsers: Observable<string[]>;

  public purchaseSelected: any = {};

  constructor(private _userService: UserService, private modalService: NgbModal, 
    private _orderService: OrderService, private readonly purchasesService: PurchasesService) { }

  ngOnInit(): void {
    this.checkOperativeSystem();
    this.getUsersAdmin();
    this.getTrm();
    this.getStores();
    this.getConveyors();
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  checkOperativeSystem() {
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      if (document.cookie.indexOf("iphone_redirect=false") == -1) {
        this.isAndroid = false;
      } else {
        this.isAndroid = true;
      }
    }
  }

  getUsersAdmin(): void {
    this._userService.getUsersAdmin()
      .subscribe((users: any) => {
        this.users = users;
      }, err => {
        throw err;
      });
  }

  getStores() {
    this._orderService.getStores()
      .subscribe((res: any) => {
        this.stores = res;
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

  getConveyors(): void {
    this._orderService.getConvenyor()
      .subscribe((res: any) => {
        this.conveyors = res;
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

  formatLockerDate() {
    if (this.filterLockerDate.value?.year) {
      return moment(new Date(this.filterLockerDate.value.year, this.filterLockerDate.value.month - 1, this.filterLockerDate.value.day))
        .format('YYYY/MM/DD')
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
    this.filterLockerDate.reset();
    this.filterStore.reset();
    this.productName.reset();
    this.purchaseNumber.reset();
    this.filterStatusProduct.reset();
    this.filterIdProduct.reset();
    this.filterPurchase();
  }

  keyDownFunction(event: any) {
    if (!this.isAndroid) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        this.filterPurchase();
      }
    } else {
      return;
    }
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
    if (this.filterDate.value && this.filterDate.value.year != '') {
      filterValues['purchase_date'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    }
    if (this.filterLockerDate.value && this.filterLockerDate.value.year != '') {
      filterValues['locker_entry_date'] = new Date(this.filterLockerDate.value.year, this.filterLockerDate.value.month - 1, this.filterLockerDate.value.day)
    }
    if (this.filterUser.value != null && this.filterUser.value != '') {
      filterValues['user'] = this.filterUser.value.id;
    }
    if (this.productName.value != null && this.productName.value.trim() != '') {
      filterValues['product_name'] = this.productName.value;
    }
    if (this.filterStore.value != null && this.filterStore.value != 'null') {
      filterValues['store'] = this.filterStore.value;
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

  openLocker(content: any, data: any): void {
    this.modalService.open(content, { size: 'xl', centered: true });
    this.purchaseSelected = data;
  }

  closeModalReceive(event: any) {
    event.close();
  }

  refreshTableReceive(event: boolean) {
    this.refreshTable.emit(event);
  }

  delete(data: any): void {
    Swal.fire({
      title: '¿Estás seguro de eliminar esta compra?',
      text: 'Está acción no será reversible.',
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Sí',
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("DATA", data);
        this.purchasesService.deletePurchase({ id: data.id })
        .subscribe((res: any) => {
          Swal.fire('', 'La compra ha sido eliminada correctamente.', 'success');
          this.refreshTable.emit(true);
        }, (err) => {
          throw err;
        })
      }
    });
  }

}

