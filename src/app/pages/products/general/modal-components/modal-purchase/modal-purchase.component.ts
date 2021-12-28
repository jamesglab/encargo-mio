import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";

@Component({
  selector: "app-modal-purchase",
  templateUrl: "./modal-purchase.component.html",
  styleUrls: ["./modal-purchase.component.scss"],
})
export class ModalPurchaseComponent implements OnInit {
  public purchaseSelected: any;

  @Output() successUpload = new EventEmitter<any>();

  public purchaseForm: FormGroup;

  public isLoading: boolean = false;

  public stores: [] = [];
  public conveyors: [] = [];

  constructor(
    private _orderService: OrderService,
    private fb: FormBuilder,
    public _notify: NotifyService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getStores();
    this.buildForm();
    this.getConvenyors();
  }

  // CREACION DE FORMULARIO Y ENVIO DE DATOS NO EDITABLES
  buildForm() {
    this.purchaseForm = this.fb.group({
      id: [this.purchaseSelected.id, Validators.required],
      product: [this.purchaseSelected.product, Validators.required],
      payment_type: [this.purchaseSelected.payment_type || "usd"],
      observations: [this.purchaseSelected.observations],
      store: [this.purchaseSelected.store, Validators.required],
      conveyor: [this.purchaseSelected.conveyor],
      product_price: [this.purchaseSelected.product_price, Validators.required],
      purchase_date: [
        {
          year: parseInt(
            moment(this.purchaseSelected.purchase_date).format("YYYY")
          ),
          month: parseInt(
            moment(this.purchaseSelected.purchase_date).format("M")
          ),
          day: parseInt(
            moment(this.purchaseSelected.purchase_date).format("D")
          ),
        },
        Validators.required,
      ],
      guide_number: [
        this.purchaseSelected.guide_number_alph ||
          this.purchaseSelected.guide_number,
      ],
      invoice_number: [
        this.purchaseSelected.invoice_number,
        Validators.required,
      ],
      locker_entry_date: [
        {
          year: parseInt(
            moment(this.purchaseSelected.locker_entry_date).format("YYYY")
          ),
          month: parseInt(
            moment(this.purchaseSelected.locker_entry_date).format("M")
          ),
          day: parseInt(
            moment(this.purchaseSelected.locker_entry_date).format("D")
          ),
        },
        Validators.required,
      ],
    });
    this.purchaseForm.disable();
  }

  // CONSUMIMOS END-POINT DE LAS TIENDAS ASOCIADAS A ENCARGOMIO
  getStores() {
    this._orderService.getStores().subscribe(
      (res: any) => {
        this.stores = res;
      },
      (err) => {
        throw err;
      }
    );
  }
  // AGREGAMOS LAS TRANSPORTADORAS
  getConvenyors() {
    this._orderService.getConvenyor().subscribe(
      (res: any) => {
        this.conveyors = res;
      },
      (err) => {
        throw err;
      }
    );
  }

  closeModale() {
    this.modalService.dismissAll();
  }

  updatePurchase() {
    if (this.purchaseForm.valid) {
      this.isLoading = true;
      const [purchase_date, locker_entry_date] = this.toInsertDates();
      this._orderService
        .updatePurchase({
          ...this.purchaseForm.getRawValue(),
          purchase_date,
          locker_entry_date,
        })
        .subscribe(
          (res: any) => {
            this.successUpload.emit(true);
            this._notify.show(
              "Compra Actualizada",
              "La orden ha sido actualizada con éxito.",
              "success"
            );
          },
          (err) => {
            this.isLoading = false;
            this._notify.show(
              "Error",
              "No se pudo actualizar la compra, intenta de nuevo",
              "error"
            );
            throw err;
          }
        );
    } else {
      this._notify.show("Error", "Campos incompletos", "warning");
    }
  }

  toInsertDates() {
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

  numberOnly(event): boolean {
    // Función para que sólo se permitan números en un input
    return numberOnly(event);
  }
}
