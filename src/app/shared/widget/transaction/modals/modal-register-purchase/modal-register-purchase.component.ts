import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { disabledItems, numberOnly } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-modal-register-purchase",
  templateUrl: "./modal-register-purchase.component.html",
  styleUrls: ["./modal-register-purchase.component.scss"],
})

export class ModalRegisterPurchaseComponent implements OnInit {

  @Input() public orderSelected: any;

  @Output() public closeModaleOut = new EventEmitter<any>();
  @Output() public refreshTable = new EventEmitter<any>();

  public stores: any[] = [];
  public products: any[] = [];
  public conveyors: any[] = [];

  public isLoading: boolean = false;
  public isSafari: boolean = false;

  public purchaseForm: FormGroup;

  public filteredOptionsProducts: Observable<string[]>;
  public filteredOptionsStores: Observable<string[]>;
  public filteredOptionsConveyors: Observable<string[]>;

  constructor(
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    public modalService: NgbModal,
  ) { }

  ngOnInit(): void { this.checkIfSafari(); }

  ngOnChanges() {
    if (this.orderSelected) {
      this.getStores();
      this.getConvenyors();
      this.buildForm();
      this.getProductsForPurchase();
    }
  }

  checkIfSafari(): void {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        this.isSafari = false;
      } else {
        this.isSafari = true;
      }
    }
  }

  // CREACION DE FORMULARIO Y ENVIO DE DATOS NO EDITABLES
  buildForm() {
    this.purchaseForm = this.fb.group({
      order_service: [{ value: this.orderSelected.id, disabled: true }, Validators.required],
      guide_number: [null],
      product: [{ value: null, disabled: true }, [Validators.required]],
      observations: [null],
      store: [{ value: null, disabled: true }, [Validators.required]],
      product_price: [null],
      purchase_date: [{ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }, [Validators.required]],
      invoice_number: [null, Validators.required],
      locker_entry_date: [null],
      conveyor: [{ value: null, disabled: true }],
      sold_out: [false]
      // payment_type: [null, Validators.required],
    });
    this.purchaseForm.controls.product.valueChanges.subscribe((product: any) => { if (product) { this.putValueProduct(product); } }); // Selecionar el valor del producto
    this.filteredOptionsProducts = this.purchaseForm.controls.product.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'products'))); // Suscribirse a los cambios de valor de product
    this.filteredOptionsStores = this.purchaseForm.controls.store.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'stores'))); // Suscribirse a los cambios del valor de store 
    this.filteredOptionsConveyors = this.purchaseForm.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors'))) // Suscribirse a los cambios de valor de conveyor
  }

  get form() {
    return this.purchaseForm.controls;
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
          this.products = res.products;
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

  displayProperty(option: any): void {
    if (option) {
      if (option.name) {
        return option.name;
      }
      return option.id;
    }
  }

  private _filter(value: any, array: any): string[] {
    if (value && value.length > 0) { // Cuando el usuario escribe el valor (No es un objecto)
      const filterValue = value.toLowerCase();
      return this[array].filter(option => option.name.toLowerCase().includes(filterValue));
    } else if (value && value.name) { // Cuando el usuario selecciona un valor en la lista desplegable
      const filterValue = value.name.toLowerCase();
      return this[array].filter(option => option.name.toLowerCase().includes(filterValue));
    } else {
      return this[array];
    }
  }

  toInsertDates() {
    if (!this.purchaseForm.getRawValue().locker_entry_date) {
      return [
        new Date(
          this.purchaseForm.getRawValue().purchase_date.year,
          this.purchaseForm.getRawValue().purchase_date.month - 1,
          this.purchaseForm.getRawValue().purchase_date.day
        )
      ];
    } else {
      return [
        new Date(
          this.purchaseForm.getRawValue().purchase_date.year,
          this.purchaseForm.getRawValue().purchase_date.month - 1,
          this.purchaseForm.getRawValue().purchase_date.day
        ),
        new Date(
          this.purchaseForm.getRawValue().locker_entry_date.year,
          this.purchaseForm.getRawValue().locker_entry_date.month - 1,
          this.purchaseForm.getRawValue().locker_entry_date.day
        ),
      ];
    }

  }

  numberOnly(event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly(event, this.isSafari);
  }

  disabledItems(item: any) {
    return disabledItems(item);
  }

  changeStatusInputs(): void {
    for (const field in this.purchaseForm.controls) {
      if (this.disabledItems(field)) {
        if (this.purchaseForm.controls.sold_out.value) {
          this.purchaseForm.controls[field].disable();
        } else {
          this.purchaseForm.controls[field].enable();
        }
      }
    }
  }

  putValueProduct(product: any): void {
    let total_value: number = 0;
    total_value += product.product_value + product.shipping_origin_value_product + product.tax;
    this.purchaseForm.get('product_price').setValue(total_value);
  }

  // ENVIAMOS LA SOLICITUD
  registerPurchase() {
    this.isLoading = true;
    if (this.purchaseForm.valid) {
      // CREAMOS LAS FECHAS CON EL METODO TO INSERT DATES
      const purchase_date = this.toInsertDates()[0];
      const locker_entry_date = this.toInsertDates()[1];
      // ENVIAMOS LOS DATOS AL ENDPOINT
      this._orderService.registerPurchase({
        ...this.purchaseForm.getRawValue(),
        purchase_date,
        locker_entry_date,
      }).subscribe((res: any) => {
        this._notify.show(`Orden de Compra Creada #${res.order_purchase.id}`, res.message, "success");
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
      }, err => {
        this._notify.show("Error", err ? err.error.message : "Ocurrió un error, intenta de nuevo.", "warning");
        this.isLoading = false;
        throw err;
      });
    } else {
      this._notify.show("Campos incompletos", "", "info");
      this.isLoading = false;
    }

  }

}
