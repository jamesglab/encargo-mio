import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-modal-register-purchase",
  templateUrl: "./modal-register-purchase.component.html",
  styleUrls: ["./modal-register-purchase.component.scss"],
})

export class ModalRegisterPurchaseComponent implements OnInit {

  @Input() public orderSelected: any = {};
  @Output() public closeModaleOut = new EventEmitter<any>();
  @Output() public refreshTable = new EventEmitter<any>();

  public stores: any = [];
  public conveyors: any = [];
  public isLoading: boolean = false;
  public purchaseForm: FormGroup;

  constructor(
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    public modalService: NgbModal,
    private config: NgbDatepickerConfig
  ) {
    //Función para no dejar seleccionar fechas anteriores al día de hoy en el calendario.
    const current = new Date();
    config.minDate = { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() };
    config.outsideDays = 'hidden';
  }

  ngOnInit(): void { }

  ngOnChanges() {
    if (this.orderSelected) {
      this.getStores();
      this.buildForm();
      this.getProductsForPurchase();
      this.getConvenyors();
    }
  }

  // CREACION DE FORMULARIO Y ENVIO DE DATOS NO EDITABLES
  buildForm() {
    this.purchaseForm = this.fb.group({
      order_service: [{ value: this.orderSelected.id, disabled: true }, Validators.required],
      guide_number: [null],
      product: [{ value: null, disabled: true }, [Validators.required]],
      payment_type: [null, Validators.required],
      observations: [null],
      store: [{ value: null, disabled: true }, [Validators.required]],
      product_price: [null],
      purchase_date: [null, Validators.required],
      invoice_number: [null, Validators.required],
      locker_entry_date: [null, Validators.required],
      conveyor: [{ value: null, disabled: true }]
    });
  }

  // CONSUMIMOS END-POINT DE LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    this._orderService.getStores().subscribe((res) => {
      if (res) {
        this.stores = res;
        this.purchaseForm.controls.store.enable();
      }
    }, err => {
      throw err;
    });
  }

  // Consumimos el endpoint para traer los productos de la orden.
  getProductsForPurchase() {
    this._orderService.ordersForPurchase({ id: this.orderSelected.id })
      .subscribe((res: any) => {
        if (res.products && res.products.length > 0) {
          this.orderSelected.products = res.products;
          this.purchaseForm.controls.product.enable();
        }
      }, err => {
        throw err;
      });
  }

  // Consumir el endpoint de las transportadoras
  getConvenyors() {
    this._orderService.getConvenyor().subscribe((res: any) => {
      if (res) {
        this.conveyors = res;
        this.purchaseForm.controls.conveyor.enable();
      }
    }, err => {
      throw err;
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
      this._orderService.registerPurchase({
        ...this.purchaseForm.getRawValue(),
        purchase_date,
        locker_entry_date,
      }).subscribe((res) => {
        this._notify.show(`Orden de Compra Creada #${res.order_purchase.id.replace(/=/g, "")}`, res.message, "success");
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
      }, err => {
        this._notify.show("Error", err ? err : "Ocurrio un error", "warning");
        this.isLoading = false;
        throw err;
      });
    } else {
      this._notify.show("Campos incompletos", "", "info");
      this.isLoading = false;
    }
  }

  setProductValue() {
    this.purchaseForm.get('product_price').setValue(
      this.orderSelected.products.find(item => item.id == this.purchaseForm.value.product).sub_total
    );
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
