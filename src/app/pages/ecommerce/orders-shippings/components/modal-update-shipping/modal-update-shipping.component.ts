import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { NotifyService } from "src/app/_services/notify.service";
import { UserService } from "src/app/_services/users.service";
import { ExportPdfService } from "../../../_services/export-pdf.service";
import { OrderService } from "../../../_services/orders.service";

@Component({
  selector: "app-modal-update-shipping",
  templateUrl: "./modal-update-shipping.component.html",
  styleUrls: ["./modal-update-shipping.component.scss"],
})

export class ModalUpdateShippingComponent implements OnInit {

  @Input() public users: any = [];
  @Input() public trm: any;
  @Input() public shippingToUpdate: any;
  @Output() getTransactions = new EventEmitter<any>();

  public isLoading: boolean = false;
  public isLoadingLabel: boolean = false;
  public conveyors: [] = [];
  public address: [] = [];
  public products: [] = [];
  public shipping_types: [] = [];
  public deleted_products: any = [];
  public updateShippingForm: FormGroup;
  public addressSelected: any = {};
  public validateAllProductsInLocker: boolean = false;
  constructor(
    private _userService: UserService,
    private _orderService: OrderService,
    private _formBuilder: FormBuilder,
    private _notify: NotifyService,
    public modalService: NgbModal,
    public _label: ExportPdfService,
    public _router: Router
  ) { }

  ngOnInit(): void {
    this.buildForm(this.shippingToUpdate);
    this.getConvenyor();
    this.getShippingTypes();
    this.validateProductsInLocker()
  }

  buildForm(shipping) {
    this.addressSelected = shipping.address;
    // SETEAMOS LOS VALORES AL FORMULARIO QUE ENCUENTRA EL USUARIO
    this.updateShippingForm = this._formBuilder.group({
      id: [shipping.id],
      trm: [this.trm],
      guide_number: [shipping.guide_number, Validators.required],
      conveyor: [shipping.conveyor, Validators.required],
      delivery_date: [
        {
          day: parseInt(moment(shipping.delivery_date).format("D")),
          month: parseInt(moment(shipping.delivery_date).format("M")),
          year: parseInt(moment(shipping.delivery_date).format("YYYY")),
        },
        Validators.required,
      ],
      total_value: [shipping.total_value, Validators.required],
      shipping_type: [shipping.shipping_type, Validators.required],
      // HACEMOS UN FIND SOBRE LOS EL USUARIO PARA RENDEREIZAR EL USUARIO AL QUE SE LE CREO EL ENVIO
      // ESTO SE DEBE A UN CAMBIO EN LA ESTRUCTURA DE LOS USUARIOS locker_id y locker{} SI NO NO SE MUESTRA EL USUARIO
      user: [
        this.users.find((item) => item.id == shipping.user.id),
        Validators.required,
      ],
      address: [shipping.address.id, Validators.required],
      observations: [shipping.observations],
      products: [null, Validators.required],
    });
    // DEBIDO AL CAMBIO EN LA ESTRUCTURA DE LOS DATOS ENVIAMOS EL ID DEL LOCKER Y LOS PRODUCTOS
    this.getInfoUser(shipping.user.locker.id, shipping.products);
  }

  getInfoUser(locker_id?, products?) {
    this._userService
      .getAddressByUser({ id: this.updateShippingForm.get("user").value.id })
      .subscribe((res) => {
        this.address = res;
      });
    // VALIDAMOS EL LOCKER ID Y ENVIAMOS LA CONSULTA PARA OBTENER LOS PRODUCTOS
    this._orderService
      .getProductsByLocker({
        locker: locker_id
          ? locker_id
          : this.updateShippingForm.get("user").value.locker_id,
      })
      .subscribe((res) => {
        let totalProducts = [];
        if (products) {
          products.map((product) => {
            // BUSCAMOS LOS PRODUCTOS DENTRO DE LA RESPUESTA PARA QUE PUEDAN SER RENDERIZADOS EN EL SELECTOR PUES SUS ESTRUCTURAS SON DIFERENTES EN LAS COSULTAS
            const find_product = res.find((p) => p.id == product.id);
            if (find_product) {
              totalProducts.push(find_product);
            }
          });
        }
        this.products = res;
        // AGREGAMOS LOS VALORES QUE ESTABAN SELECCIONADOS EN EL FORMULARIO
        this.updateShippingForm.get("products").setValue(totalProducts);
      });
  }


  validateProductsInLocker() {
    this.shippingToUpdate.products.map(p => {
      if (p.status != 1) {
        this.validateAllProductsInLocker = true;
      }
    })
  }
  // AGREGAMOS LAS TRANSPORTADORAS
  getConvenyor() {
    this._orderService.getConvenyor().subscribe((res) => {
      this.conveyors = res;
    });
  }

  getShippingTypes() {
    this._orderService.getShippingTypes().subscribe((res) => {
      this.shipping_types = res;
    });
  }

  // METODO PARA ACTUALIZAR LA ORDEN
  updateShipping() {
    if (this.updateShippingForm.valid && this.updateShippingForm.value.products.length > 0) {
      const delivery_date = new Date(
        this.updateShippingForm.getRawValue().delivery_date.year,
        this.updateShippingForm.getRawValue().delivery_date.month,
        this.updateShippingForm.getRawValue().delivery_date.day
      );
      this.isLoading = true;
      this._orderService
        .updateShipping({
          ...this.updateShippingForm.getRawValue(),
          deleted_products: this.deleted_products,
          delivery_date
        })
        .subscribe((res) => {
          this.modalService.dismissAll();
          this.getTransactions.emit(true);
          this._notify.show('Orden de envio Actualizada', '', 'success');
        }, err => {
          this.isLoading = false;
          this._notify.show('Error', 'no pudimos actualizar la orden', 'error');
        });
    } else {
      this._notify.show('Error', 'Revisa el formulario hay campos requeridos incompletos', 'error');
    }
  }

  closeModale() {
    this.modalService.dismissAll();
  }

  removeProduct(product) {
    this.deleted_products.push(product);
  }

  addProduct(product) {
    this.deleted_products.map((p, i) => {
      if (p.id == product.id) {
        this.deleted_products.splice(i, 1);
      }
    });
  }

  generateLabel() {
    this.isLoadingLabel = true;
    let UID: string = "";
    UID = this.updateShippingForm.getRawValue().id;
    for (let index = 0; index < this.updateShippingForm.getRawValue().products.length; index++) {
      UID = UID + '-' + this.updateShippingForm.getRawValue().products[index].id;
    }
    this._label.exportToLabel(this.updateShippingForm.getRawValue(), this.addressSelected, UID).then(() => {
      this.isLoadingLabel = false;
    });
  }

  updateShippingPackcage() {
      this.isLoading = true;
      this._orderService
        .updateShippingPacked({
          status: '2',
          id : this.shippingToUpdate.id 
        })
        .subscribe((res) => {
          this.modalService.dismissAll();
          this.getTransactions.emit(true);
          this._notify.show('Orden de envio Actualizada', '', 'success');
        }, err => {
          this.isLoading = false;
          this._notify.show('Error', 'no pudimos actualizar la orden', 'error');
        });

  }
  goToFragment() {
    if (this.updateShippingForm.getRawValue().id) {
      this._router.navigate(["/fragment/" + this.updateShippingForm.getRawValue().id]);
      this.modalService.dismissAll();
    } else {
      return;
    }
  }

}
