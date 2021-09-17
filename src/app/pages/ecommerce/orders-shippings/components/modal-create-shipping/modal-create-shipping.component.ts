import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifyService } from 'src/app/_services/notify.service';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-modal-create-shipping',
  templateUrl: './modal-create-shipping.component.html',
  styleUrls: ['./modal-create-shipping.component.scss']
})
export class ModalCreateShippingComponent implements OnInit {
  public isLoading: boolean = false;
  public conveyors: [] = [];

  @Input() public users: any = [];
  public address: [] = [];
  public products: [] = [];
  public shipping_types: [] = [];

  public createShippingForm: FormGroup;

  constructor(
    private _userService: UserService,
    private _orderService: OrderService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService

  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getConvenyor();
    this.getShippingTypes();
  }

  buildForm() {
    this.createShippingForm = this._formBuilder.group({
      international_guide: [null, Validators.required],
      conveyor: [null, Validators.required],
      date_delivery: [null, Validators.required],
      shipping_value: [null, Validators.required],
      shipping_type: [null, Validators.required],
      user: [null, Validators.required],
      address: [null, Validators.required],
      purchase_observations: [null, Validators.required],
      pruducts: [null, Validators.required],
    });
  }

  getAddresByUser() {
    this._userService.getAddressByUser({ id: this.createShippingForm.get('user').value.id }).subscribe(res => {
      this.address = res;
    });
    this._orderService.getProductsByLocker({ locker: this.createShippingForm.get('user').value.locker_id }).subscribe(res => {
      this.products = res;
    })
  }
  // AGREGAMOS LAS TRANSPORTADORAS
  getConvenyor() {
    this._orderService.getConvenyor().subscribe(res => {
      this.conveyors = res;
    })
  }
  getShippingTypes() {
    this._orderService.getShippingTypes().subscribe(res => {
      this.shipping_types = res;
    });
  }

  createShipping() {

    if (this.createShippingForm.valid) {

    } else {
      this._notify.show('Error','Valida El fomulario','warning')
    }

  }
}
