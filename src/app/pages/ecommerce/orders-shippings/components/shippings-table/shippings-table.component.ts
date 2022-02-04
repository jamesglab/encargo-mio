import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from "moment";
import { OrderService } from '../../../_services/orders.service';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-shippings-table',
  templateUrl: './shippings-table.component.html',
  styleUrls: ['./shippings-table.component.scss']
})

export class ShippingsTableComponent implements OnInit {

  @Input() public shippings: any = [];
  @Input() public users: any = [];
  @Input() public status: number;
  @Input() public resetAllFilters: boolean;

  @Output() public shippingSelected = new EventEmitter<any>();
  @Output() public shippingTracking = new EventEmitter<any>();
  @Output() public showChangeStatusModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() public shipping = new EventEmitter<any>();
  @Output() public filterData = new EventEmitter<any>();
  @Output() public defaultResetValues = new EventEmitter<any>();

  public isLoading: boolean = false;
  public isAndroid: boolean = false;

  public typesShippings: any = [];
  public filteredUsers: Observable<string[]>;
  public filteredAddress: Observable<string[]>;
  public shippingsFilters: FormGroup;

  constructor(
    private _orderService: OrderService,
    public _fb: FormBuilder,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkOperativeSystem();
    this.getTypes();
    this.shippingsFilters = this._fb.group({
      shipping: [null],
      order_service: [null],
      created_at: [null],
      user: [null],
      guide_number: [null],
      shipping_type: [null],
      shipping_value: [null]
    });
    this.filteredUsers = this.shippingsFilters.controls.user.valueChanges.
      pipe(startWith(''), map(value => this._filter(value, 'users')));
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

  ngOnChanges() {
    if (this.resetAllFilters) {
      this.shippingsFilters.reset();
      this.filterData.emit({ data: this.shippingsFilters.getRawValue(), reset: true });
      this.defaultResetValues.emit(false);
      this._cdr.detectChanges();
    }
  }

  get form() {
    return this.shippingsFilters.controls;
  }

  getTypes(): void {
    this._orderService.getShippingTypes()
      .subscribe((res: any) => {
        this.typesShippings = res;
      }, err => {
        throw err;
      });
  }

  getOrderById(id: any) {
    this.isLoading = true;
    this._orderService.getShippingById({ id })
      .subscribe((res: any) => {
        this.isLoading = false;
        this.shippingSelected.emit(res);
      }, err => {
        this.isLoading = false;
        throw err;
      });
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
    if (value) {
      if (typeof value === 'object') {
        if (array === 'users') {
          return value.full_name.toLowerCase().replace(/\s/g, '');
        }
      } else {
        return value.toLowerCase().replace(/\s/g, '');
      }
    }
  }

  sendShippingTracking(data: any) {
    this.shippingTracking.emit(data);
  }

  changeStatusModal(shipping_order: { [key: string]: any }): void {
    this.showChangeStatusModal.emit(shipping_order);
  }

  numberOnly($event): boolean { return numberOnly($event, this.isAndroid); } // Función para que sólo se permitan números en un input

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
  }

  formatDate() {
    if (this.form.created_at.value) {
      return moment(new Date(this.form.created_at.value.year, this.form.created_at.value.month - 1, this.form.created_at.value.day)).format('YYYY/MM/DD');
    } else {
      return '';
    }
  }

  sendFilter(): void {
    this.filterData.emit({ data: this.filterValidation(), reset: false });
  }

  filterValidation() {
    const filterValues: any = {};
    if (this.form.shipping.value && this.form.shipping.value.trim() != '') {
      filterValues['shipping'] = this.form.shipping.value;
    }
    if (this.form.order_service.value && this.form.order_service.value.trim() != '') {
      filterValues['order_service'] = this.form.order_service.value;
    }
    if (this.form.created_at.value && this.form.created_at.value.year) {
      filterValues['created_at'] = this.formatDate();
    }
    if (this.form.user.value) {
      filterValues['user'] = this.form.user.value.id;
    }
    if (this.form.guide_number.value && this.form.guide_number.value.trim() != '') {
      filterValues['guide_number'] = this.form.guide_number.value;
    }
    if (this.form.shipping_type.value && this.form.shipping_type.value != 'null' && this.form.shipping_type.value != null) {
      filterValues['shipping_type'] = this.form.shipping_type.value;
    }
    if (this.form.shipping_value.value > 0) {
      filterValues['shipping_value'] = this.form.shipping_value.value;
    }
    return filterValues;
  }

  keyDownFunction(event: any) {
    if (!this.isAndroid) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        this.sendFilter();
      }
    } else {
      return;
    }
  }

}
