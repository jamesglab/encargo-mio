import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
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
  @Input() public status: number;

  @Output() public shippingSelected = new EventEmitter<any>();
  @Output() public shippingTracking = new EventEmitter<any>();
  @Output() public shipping = new EventEmitter<any>();

  public isLoading: boolean = false;

  public typesShippings: any = [];
  public users: any = [];
  public address: any = [];

  public shippingsFilters: FormGroup;
  public filteredUsers: Observable<string[]>;
  public filteredAddress: Observable<string[]>;

  constructor(
    private _orderService: OrderService,
    public _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getTypes();
    this.shippingsFilters = this._fb.group({
      shipping: [null],
      created_at: [null],
      user: [null],
      address: [null],
      shipping_type: [null],
      shipping_value: [null]
    });
    this.filteredUsers = this.shippingsFilters.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    this.filteredAddress = this.shippingsFilters.controls.address.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'address')));
  }

  get form() {
    return this.shippingsFilters.controls;
  }

  getTypes(): void {
    this._orderService.getShippingTypes()
      .subscribe((res: any) => {
        this.typesShippings = res;
        console.log(this.typesShippings);
      }, err => {
        throw err;
      });
  }

  ngOnChanges() {
    console.log(this.shippings);
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

  sendShippingTracking(data: any) {
    if (data.conveyor_status) {
      this.shippingTracking.emit(data);
    } else {
      Swal.fire('No hay registro de la transportadora.', '', 'info');
    }
  }

  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

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
    console.log("TESTTTTTTT SEND", this.shippingsFilters.getRawValue());
    this._orderService.getAllShippings({ ...this.filterValidation() })
      .subscribe((res: any) => {
        this.shippings = [];
        this.shippings = res.shipping_orders;
      }, err => {
        throw err;
      });
  }

  filterValidation() {
    let filterValues: any = { status: this.status, page: 1, pageSize: 9 };
    console.log(this.form);
    if (this.form.shipping.value != '' && this.form.shipping.value != null) {
      filterValues['shipping'] = this.form.shipping.value;
    } if (this.form.created_at.value && this.form.created_at.value.year) {
      filterValues['created_at'] = this.formatDate();
    } if (this.form.user.value != null && this.form.user.value != '') {
      filterValues['user'] = this.form.user.value.id;
    } else if (this.form.address.value != '' && this.form.address.value != null) {
      filterValues['address'] = this.form.address.value.id;
    } else if (this.form.shipping_type.value != '' && this.form.shipping_type.value != null) {
      filterValues['shipping_type'] = this.form.shipping_type.value;
    } else if (this.form.shipping_value.value > 0 && this.form.shipping_type.value != null) {
      filterValues['shipping_value'] = this.form.shipping_value.value;
    }
    console.log("FILTER:,", filterValues)
    return filterValues;
  }

}
