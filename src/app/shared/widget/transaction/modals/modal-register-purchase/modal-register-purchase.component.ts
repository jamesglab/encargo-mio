import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";

@Component({
  selector: "app-modal-register-purchase",
  templateUrl: "./modal-register-purchase.component.html",
  styleUrls: ["./modal-register-purchase.component.scss"],
})
export class ModalRegisterPurchaseComponent implements OnInit {
  @Input() orderSelected;
  @Output() closeModaleOut = new EventEmitter<any>();
  public stores = [];
  public isLoading: boolean = false;
  public purchaseForm: FormGroup;
  constructor(
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    public modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getStores();
    this.buildForm();
  }

  // CREACION DE FORMULARIO Y ENVIO DE DATOS NO EDITABLES
  buildForm() {
    this.purchaseForm = this.fb.group({
      order_service: [
        { value: this.orderSelected.id, disabled: true },
        Validators.required,
      ],
      product: [null, Validators.required],
      payment_type: [null, Validators.required],
      observations: [null, Validators.required],
      store: [null, Validators.required],
      product_price: [null],
      purchase_date: [null, Validators.required],
      invoice_number: [null, Validators.required],
      locker_entry_date: [null, Validators.required],
    });
  }

  // CONSUMIMOS END-POINT DE LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    this._orderService.getStores().subscribe((res) => {
      this.stores = res;
    });
  }

  closeModale() {
    this.closeModaleOut.emit(true);
  }

  // ENVIAMOS LA SOLICITUD
  registerPurchase() {
    this.isLoading = true;
    if (this.purchaseForm.valid) {
      // CREAMOS LAS FECHAS CON EL METODO TOINSERTDATES
      const purchase_date = this.toInsertDates()[0];
      const locker_entry_date = this.toInsertDates()[1];
      // ENVIAMOS LOS DATOS AL ENDPOINT
      this._orderService
        .registerPurchase({
          ...this.purchaseForm.getRawValue(),
          purchase_date,
          locker_entry_date,
        })
        .subscribe(
          (res) => {
            this._notify.show(
              `Orden de Compra Creada #${res.order_purchase.id.replace(/=/g, "")}`,
              res.message,
              "success"
            );
            this.modalService.dismissAll();
          },
          (err) => {
            this._notify.show(
              "Error",
              err ? err : "Ocurrio un error",
              "warning"
            );
            this.isLoading = false;
          }
        );
    } else {
      this._notify.show("Campos incompletos", "", "info");
      this.isLoading = false;
    }
  }
  setProductValue() {
    console.log(this.purchaseForm.value.product)
    this.purchaseForm.get('product_price').setValue(this.orderSelected.products.find(item =>  item.id == this.purchaseForm.value.product ).sub_total)
  }
  toInsertDates() {
    return [
      new Date(
        this.purchaseForm.getRawValue().purchase_date.year,
        this.purchaseForm.getRawValue().purchase_date.month,
        this.purchaseForm.getRawValue().purchase_date.day
      ),
      new Date(
        this.purchaseForm.getRawValue().locker_entry_date.year,
        this.purchaseForm.getRawValue().locker_entry_date.month,
        this.purchaseForm.getRawValue().locker_entry_date.day
      ),
    ];
  }
  numberOnly(event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly(event);
  }
}
