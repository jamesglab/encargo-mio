import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';

@Component({
  selector: 'app-modal-register-purchase',
  templateUrl: './modal-register-purchase.component.html',
  styleUrls: ['./modal-register-purchase.component.scss']
})
export class ModalRegisterPurchaseComponent implements OnInit {
  @Input() orderSelected;
  @Output() closeModaleOut = new EventEmitter<any>();
  public stores = [];
  public isLoading: boolean = false;
  public purchaseForm: FormGroup;
  constructor(
    private _orderService: OrderService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getStores();
    this.buildForm();
  }


  buildForm() {

    this.purchaseForm = this.fb.group({
      product: [null],
      store: [null],
      paymentType: [null],
      totalPurchase: [{ value: this.orderSelected.total_value, disabled: true }],
      order: [{ value: this.orderSelected.id, disabled: true }],
      datePurchase: [null],
      observations: [null],
      dateLocker: [null]
    });

  }

  // CONSUMIMOS END-POINT DE LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    this._orderService.getStores().subscribe(res => {
      this.stores = res;
    });
  }

  closeModale(){
    this.closeModaleOut.emit(true);
  }
}
