import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Observable } from "rxjs";
import { filter, map, startWith } from "rxjs/operators";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { NotifyService } from "src/app/_services/notify.service";
import { UserService } from "src/app/_services/users.service";
import Swal from 'sweetalert2';

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})

export class TransactionComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Output() public filterValues: EventEmitter<any> = new EventEmitter();

  @Input() public status: string;
  @Input() public transactions: Array<{
    id?: string;
    estimeted_value?: number;
    trm?: string;
    created_at?: string;
    updated_at?: string;
    is_shipping_locker?: boolean;
  }>;

  public filterUser = new FormControl('');
  public filterId = new FormControl('');
  public filterDate = new FormControl({ value: '' });
  public filterAdvancePurchase = new FormControl(null);
  public filterShippingType = new FormControl(null);
  public filterPaymentMethod = new FormControl(null);

  public filteredUsers: Observable<string[]>;
  public orderSelected: any = {};

  public users: [] = [];

  public isLoading: boolean = false;
  public isAndroid: boolean = false;

  constructor(
    private modalService: NgbModal,
    public _notify: NotifyService,
    private _userService: UserService,
    private _orders: OrderService
  ) { }

  ngOnInit() {
    this.getUsersAdmin();
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    this.checkOperativeSystem();
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

  ngOnChanges() { }

  filterOrders() {
    const filterValues = {};
    if (this.filterId.value && this.filterId.value != '') {
      filterValues['id'] = this.filterId.value
    } if (this.filterDate?.value && this.filterDate.value.year) {
      filterValues['created_at'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    } if (this.filterUser.value != null && this.filterUser.value != '') {
      filterValues['user'] = this.filterUser.value.id;
    } if (this.filterAdvancePurchase.value != null && this.filterAdvancePurchase.value != 'null') {
      filterValues['advance_purchase'] = this.filterAdvancePurchase.value;
    } if (this.filterShippingType.value != null && this.filterShippingType.value != 'null') {
      filterValues['is_shipping_locker'] = this.filterShippingType.value;
    } if (this.filterPaymentMethod.value != null && this.filterPaymentMethod.value != 'null') {
      filterValues['payment_method'] = this.filterPaymentMethod.value;
    }
    this.filterValues.emit(filterValues);
  }

  keyDownFunction(event: any) {
    if (!this.isAndroid) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        this.filterOrders();
      }
    } else {
      return;
    }
  }

  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(users => {
      this.users = users;
    }, err => {
      throw err;
    });
  }

  openModal(order: any, modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
    this.orderSelected = order
    this.orderSelected.trm = 0;
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

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
  }

  formatDate() {
    if (this.filterDate.value.year) {
      return moment(new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)).format('YYYY/MM/DD')
    } else {
      return ''
    }
  }

  getStatusNumber(status: string): number {
    return parseInt(status || '0');
  }

  formatPaymentMethod(payment_method: string): string {
    if (payment_method) {
      return (payment_method == 'transfer') ? 'Transferencia' : 'Credito';
    }
    return '';

  }

  private _normalizeValue(value: any, array: any): string {
    if (typeof value === 'object') {
      if (array === 'conveyors') {
        return value.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value.full_name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'address') {
        return value.address.toLowerCase().replace(/\s/g, '');
      }
    } else {
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

  delete(data: any): void {
    Swal.fire({
      title: '¿Estás seguro de eliminar esta orden?',
      text: 'Por favor escribe el motivo de la cancelación, reucuerda que esta acción será ireversible.',
      input: 'text',
      inputAttributes: { autocapitalize: 'off', placeholder: "Ingresa el motivo de la cancelación." },
      showCancelButton: true,
      confirmButtonText: 'Sí',
      showLoaderOnConfirm: true,
      cancelButtonText: "Cancelar",
      preConfirm: (reason: string) => {
        if (reason) {
          this._orders.cancelOrderWithReason(data.id, reason)
            .subscribe((res: any) => {
              Swal.fire('', 'Has eliminado la orden correctamente.', 'success');
              this.refreshTable.emit(true);
              return res;
            }, err => {
              Swal.showValidationMessage(`Ha ocurrido un error al intentar eliminar la orden.`);
              throw err;
            });
        } else {
          Swal.showValidationMessage(`Debes ingresar un motivo de cancelación.`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

}
