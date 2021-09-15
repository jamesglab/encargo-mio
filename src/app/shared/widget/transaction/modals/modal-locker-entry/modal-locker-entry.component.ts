import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { NotifyService } from 'src/app/_services/notify.service';

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
  files: File[] = [];

  constructor(
    public modalService: NgbModal,
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,

  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getLockerByUser();
    this.getPurchaseByOrder();
    this.getConvenyor();
  }

  buildForm() {
    this.lockerForm = this.fb.group({
      order_service: [
        { value: this.orderSelected.id, disabled: true },
        Validators.required,
      ],
      order_purchase_object: [null, Validators.required],
      locker: [null, Validators.required],
      product_description: [null, Validators.required],
      weight_in_pounds: [null, Validators.required],
      receipt_date: [null, Validators.required],
      conveyor: [null, Validators.required],
      guide_number: [null, Validators.required],
      shipping_value: [
        this.orderSelected?.shipping_value_client
          ? this.orderSelected?.shipping_value_client?.value : 0, Validators.required
      ],
      admin_value: [null, Validators.required],
      product_observations: [null, Validators.required],
      force_commercial_shipping: [null],
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
      // ADINGNAMOS LAS ORDENES QUE TIENEN LOS PRODUCTOS
      this.orders_purchase = res;
    });
  }

  getConvenyor() {
    this._orderService.getConvenyor().subscribe(res => {
      this.conveyors = res;
    })
  }

  closeModale() {
    this.modalService.dismissAll();
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  addLocker() {
    console.log('form',this.lockerForm)
    if (this.lockerForm.valid && this.files.length > 0) {
      var formData = new FormData();
      this.files.forEach((file) => { formData.append('images', file) });
      formData.append("payload", JSON.stringify(this.createFormToSendApi(this.lockerForm.getRawValue())));
      this._orderService.insertProductLocker(formData).subscribe(res => {
        this._notify.show(
          `Producto #${this.lockerForm.getRawValue().order_purchase_object.id.replace("==","")} Agregado`,
          res.message,
          "success"
        );
        this.modalService.dismissAll();
      }, err => {
        this._notify.show(
          "Error",
          err ? err : "Ocurrio un error",
          "warning"
        );
      })
    } else {
      this._notify.show('Datos incompletos', 'Revisa los datos o las imagenes del producto', 'warning')
    }

  }

  // CREAMOS EL OBJETO QUE RECIBE EL API
  createFormToSendApi(form) {
    return {
      locker: form.locker,
      product: form.order_purchase_object.product.id,
      order_purchase: form.order_purchase_object.id,
      weight_in_pounds: form.weight_in_pounds,
      receipt_date: this.createReceiptDate(form.receipt_date),
      conveyor: form.convenyor,
      guide_number: form.guide_number,
      shipping_value: form.shipping_value,
      force_commercial_shipping: form.force_commercial_shipping,
      product_description: form.product_description,
      product_observations: form.product_observations
    }
  }

  // CREAMOS LA FECHA DE RECIBIDO
  createReceiptDate(date) {
    return new Date(date.year, date.month, date.day)
  }
  // onSelect(event){
  //   console.log('event',event);
  //   this.files.push(event.addedFiles[0])

  // }

  // onRemove(event){

  // }

}
