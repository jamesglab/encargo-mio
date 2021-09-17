import { Component, Input, OnInit, Output ,EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  @Input() public trm : any ;
  @Output() getTransactions =  new EventEmitter<any>();


  public isLoading: boolean = false;
  public conveyors: [] = [];
  public address: [] = [];
  public products: [] = [];
  public shipping_types: [] = [];
  public createShippingForm: FormGroup;

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
      trm:[this.trm],
      guide_number: [null, Validators.required],
      conveyor: [null, Validators.required],
      delivery_date: [null, Validators.required],
      shipping_value: [null, Validators.required],
      shipping_type: [null, Validators.required],
      user: [null, Validators.required],
      address: [null, Validators.required],
      purchase_observations: [null, Validators.required],
      products: [null, Validators.required],
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
      this.isLoading = true;
      const delivery_date = new Date(this.createShippingForm.value.delivery_date.year,
        this.createShippingForm.value.delivery_date.month,
        this.createShippingForm.value.delivery_date.day);
      this._orderService.createShipping({
        ...this.createShippingForm.getRawValue(),
        delivery_date

      }).subscribe(res => {
        this._notify.show(
          `Envio Creado`,
          res.message,
          "success"
        );
        this.modalService.dismissAll();
        this.getTransactions.emit(true);
      },err=>{
        this.isLoading = false;
        this._notify.show(
          "Error",
          err ? err : "Ocurrio un error",
          "warning"
        );
      })
    } else {
      this._notify.show('Error', 'Valida El fomulario', 'warning')
    }

  }
}
