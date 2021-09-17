import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotifyService } from 'src/app/_services/notify.service';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../../../_services/orders.service';

@Component({
  selector: 'app-modal-update-shipping',
  templateUrl: './modal-update-shipping.component.html',
  styleUrls: ['./modal-update-shipping.component.scss']
})
export class ModalUpdateShippingComponent implements OnInit {
  @Input() public users: any = [];
  @Input() public trm: any;
  @Input() public shippingToUpdate: any;

  @Output() getTransactions = new EventEmitter<any>();
  public isLoading: boolean = false;
  public conveyors: [] = [];
  public address: [] = [];
  public products: [] = [];
  public shipping_types: [] = [];
  updateShippingForm: FormGroup;
  constructor(
    private _userService: UserService,
    private _orderService: OrderService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService,
    public modalService: NgbModal,

  ) { }

  ngOnInit(): void {
    this.buildForm(this.shippingToUpdate);
    this.getConvenyor();
    this.getShippingTypes();
  }



  buildForm(shipping) {
    this.updateShippingForm = this._formBuilder.group({
      trm: [this.trm],
      guide_number: [shipping.guide_number, Validators.required],
      conveyor: [shipping.conveyor, Validators.required],
      delivery_date: [, Validators.required],
      shipping_value: [shipping.shipping_value, Validators.required],
      shipping_type: [shipping.shipping_type, Validators.required],
      user: [shipping.user, Validators.required],
      address: [shipping.address.id, Validators.required],
      purchase_observations: [shipping.observations, Validators.required],
      products: [shipping.products, Validators.required],
    });
  console.log('tenemos formulario',this.updateShippingForm)
  this.updateShippingForm.get('user').setValue(shipping.user)
  this.getAddresByUser();
  }

  getAddresByUser() {
    this._userService.getAddressByUser({ id: this.updateShippingForm.get('user').value.id }).subscribe(res => {
      this.address = res;
    });
    this._orderService.getProductsByLocker({ locker: this.updateShippingForm.get('user').value.locker_id }).subscribe(res => {
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


  // METODO PARA ACTUALIZAR LA ORDEN
  updateShipping() {

  }

}
