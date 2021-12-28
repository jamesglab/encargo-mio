import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-modal-create-shipping',
  templateUrl: './modal-create-shipping.component.html',
  styleUrls: ['./modal-create-shipping.component.scss']
})

export class ModalCreateShippingComponent implements OnInit {

  @Input() public users: any = [];
  @Input() public trm: any;
  @Output() getTransactions = new EventEmitter<any>();

  public isLoading: boolean = false;
  public conveyors: [] = [];
  public address: [] = [];
  public products: [] = [];
  public shipping_types: [] = [];

  public createShippingForm: FormGroup;
  public filteredUsers: Observable<string[]>;
  public filteredAddress: Observable<string[]>;

  constructor(
    private _userService: UserService,
    private _orderService: OrderService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getConvenyor();
    this.getShippingTypes();
  }

  buildForm() {
    this.createShippingForm = this._formBuilder.group({
      trm: [this.trm],
      guide_number: [null],
      conveyor: [null],
      delivery_date: [null],
      total_value: [0, [Validators.required, Validators.min(1)]],
      shipping_type: [null, [Validators.required]],
      user: [null, [Validators.required]],
      address: [null, [Validators.required]],
      observations: [null],
      products: [null, [Validators.required]],
      consolidated: [false]
    });
    this.filteredUsers = this.createShippingForm.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    this.filteredAddress = this.createShippingForm.controls.address.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'address')));
    this.createShippingForm.controls.user.valueChanges.subscribe((user: any) => {
      if (typeof user === 'object') {
        this.getAddresByUser();
      }
    });
  }

  async getAddresByUser() {
    this.createShippingForm.controls.address.disable();
    this.createShippingForm.controls.products.disable();
    this.createShippingForm.controls.address.setValue(null);
    this.createShippingForm.controls.products.setValue(null);
    await this._userService.getAddressByUser({ id: this.createShippingForm.get('user').value.id })
      .subscribe((res: any) => {
        this.address = res.addressess;
        this.createShippingForm.controls.address.enable();
      }, err => {
        this.createShippingForm.controls.address.enable();
        throw err;
      });
    await this._orderService.getProductsByLocker({ locker: this.createShippingForm.get('user').value.locker_id, status: 0 })
      .subscribe((res: any) => {
        this.products = res;
        this.createShippingForm.controls.products.enable();
      }, err => {
        this.createShippingForm.controls.products.enable();
        throw err;
      });
  }

  // AGREGAMOS LAS TRANSPORTADORAS
  getConvenyor() {
    this._orderService.getConvenyor().subscribe((res: any) => {
      this.conveyors = res;
    }, err => {
      throw err;
    });
  }

  getShippingTypes() {
    this._orderService.getShippingTypes().subscribe((res: any) => {
      this.shipping_types = res;
    }, err => {
      throw err;
    });
  }

  createShipping() {
    if (this.createShippingForm.valid) {

      this.isLoading = true;
      let delivery_date = null;
      if (this.createShippingForm.value.delivery_date) {
        delivery_date = new Date(
          this.createShippingForm.value.delivery_date.year,
          this.createShippingForm.value.delivery_date.month - 1,
          this.createShippingForm.value.delivery_date.day
        );
      }

      this._orderService.createShipping({
        ...this.createShippingForm.getRawValue(),
        delivery_date
      }).subscribe((res: any) => {
        this._notify.show(`Envio Creado`, res.message, "success");
        this.modalService.dismissAll();
        this.getTransactions.emit(true);
      }, err => {
        this.isLoading = false;
        this._notify.show("Error", err ? err.error.message : "Ocurró un error, intenta de nuevo.", "warning");
        throw err;
      });
    } else {
      this._notify.show('Error', 'No has llenado el formulario completamente.', 'warning');
    }
  }

  _filter(value: string, array: any): string[] {
    console.log(this[array]);
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
        } else if (array === 'address') {
          return value.address.toLowerCase().replace(/\s/g, '');
        }
      } else {
        return value.toLowerCase().replace(/\s/g, '');
      }
    }
  }

  displayFnUserName(name: any) {
    return name ? `CA ${name.locker_id} | ${name.name} ${name.last_name}` : "";
  }

  displayFnAddress(address: any) {
    return address ? address.address : "";
  }

  renderName(locker_product: { [ key: string ]: any }): string {
    if(locker_product.product) {
      let product = locker_product.product;
      if(product.name) {
        let name = product.name;
        if(product.name.length > 40){
         name = product.name.slice(0, 40);
        }
        return `${product.id} | ${name}`;
      }
      return `${product.id} | -`;
    }
    return '-';
  }

  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

  closeModale() {
    this.modalService.dismissAll();
  }

}
