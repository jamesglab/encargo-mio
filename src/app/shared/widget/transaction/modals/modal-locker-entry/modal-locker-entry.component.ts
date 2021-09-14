import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';

@Component({
  selector: 'app-modal-locker-entry',
  templateUrl: './modal-locker-entry.component.html',
  styleUrls: ['./modal-locker-entry.component.scss']
})
export class ModalLockerEntryComponent implements OnInit {

  @Input() orderSelected;
  public isLoading: boolean;
  public lockers = [];
  public orders_purchase: [] = [];
  public conveyors: [] = [];
  lockerForm: FormGroup;


  constructor(
    public modalService: NgbModal,
    private _orderService: OrderService,
    private fb: FormBuilder


  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getLockerByUser();
    this.getPurchaseByOrder();
  }

  buildForm() {
    this.lockerForm = this.fb.group({
      order_service: [
        { value: this.orderSelected.id, disabled: true },
        Validators.required,
      ],
      locker: [null, Validators.required],
      payment_type: [null, Validators.required],
      observations: [null, Validators.required],
      store: [null, Validators.required],
      total_price: [{ value: this.orderSelected.total_value, disabled: true }],
      purchase_date: [null, Validators.required],
      locker_entry_date: [null, Validators.required],
    });
  }

  getLockerByUser() {
    this._orderService.getLockerByUser({ user: this.orderSelected.user.id }).subscribe((res: any) => {
      // ASIGNAMOS EL LOCKER DEL USUARIO... PUEDEN EXISTIR MAS LOCKERS
      this.lockers.push(res);
    })
  }


  getPurchaseByOrder() {
    this._orderService.getPurchaseByOrder({ order_service: this.orderSelected.id }).subscribe(res => {
      this.orders_purchase = res;
    })
  }
  closeModale() {
    this.modalService.dismissAll();
  }

}
