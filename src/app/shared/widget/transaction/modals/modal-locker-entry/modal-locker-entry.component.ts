import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-modal-locker-entry',
  templateUrl: './modal-locker-entry.component.html',
  styleUrls: ['./modal-locker-entry.component.scss']
})
export class ModalLockerEntryComponent implements OnInit {

  @Input() orderSelected;
  @Output() refreshTable = new EventEmitter<any>();
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
          ? this.orderSelected?.shipping_value_client?.value : 0
      ],
      admin_value: [null, Validators.required],
      product_observations: [null],
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
  // AGREGAMOS LAS TRANSPORTADORAS
  getConvenyor() {
    this._orderService.getConvenyor().subscribe(res => {
      this.conveyors = res;
    })
  }
  // CERRAMOS EL MODAL
  closeModale() {
    this.modalService.dismissAll();
  }
  // AGREGAMOS LAS IMAGENES AL ARRAY DE FILES
  onSelect(event) {
    this.files.push(...event.addedFiles);
  }
  // ELIMINAMOS LA IMAGEN
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  // AGREGAMOS AL LOCKER
  addLocker() {
    // VALIDAMOS QUE EXISTAN IMAGENES Y ADICIONAL QUE EXISTAN LOS CAMPOS OBLIGATORIOS
    if (this.lockerForm.valid && this.files.length > 0) {
      // CREAMOS EL FORM DATA
      this.isLoading = true;
      var formData = new FormData();
      // AGREGAMOS AL CAMPO FILE LAS IMAGENES QUE EXISTAN ESTO CREARA VARIOS ARCHIVOS EN EL FORMDATA PERO EL BACKEND LOS LEE COMO UN ARRAY
      this.files.forEach((file) => { formData.append('images', file) });
      // AGREGAMOS LOS CAMPOS DEL FORMULARIO A UN NUEVO OBJETO
      formData.append("payload", JSON.stringify(this.createFormToSendApi(this.lockerForm.getRawValue())));
      // CONSUMIMOS EL SERVICIO DEL BACK PARA INGRESAR EL PRODUCTO 
      this._orderService.insertProductLocker(formData).subscribe(res => {
        this._notify.show(
          `Producto #${this.lockerForm.getRawValue().order_purchase_object.id.replace(/=/g, "")} Agregado`,
          res.message,
          "success"
        );
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
      }, err => {
        console.log("ERROR", err);
        this.isLoading = false;
        this._notify.show("Error", err.error ? err.error.message : "Ocurrió un error al intentar registrar el producto.", "warning");
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

  numberOnly(event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly(event);
  }

}
