import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly, validateErrors } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-modal-edit-order",
  templateUrl: "./modal-edit-order.component.html",
  styleUrls: ["./modal-edit-order.component.scss"],
})

export class ModalEditOrderComponent implements OnInit {

  @Input() public orderSelected: any = null;
  @Input() public status: any;
  @Output() public refreshTable = new EventEmitter<any>();

  public subTotalPrice: number = 0;
  public totalPrice: number = 0;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public disabledInputs: boolean = false;
  public disabledAllInputs: boolean = false;
  public isLoadingQuery: boolean = false;
  public productSelected: any;

  constructor(
    private _orders: OrderService,
    public _notify: NotifyService,
    public modalService: NgbModal
  ) { }

  ngOnInit(): void { }

  ngOnChanges() {
    if (this.orderSelected) {
      this.calculateValuesInit();
    }
  }

  calculateValuesInit() {
    this.isLoadingQuery = true;
    this._orders.detailOrder({ id: this.orderSelected.id })
      .subscribe((res: any) => {
        if (res) {

          if (res.products.length == 0) {
            Swal.fire('No existen productos', '', 'info');
            this.modalService.dismissAll();
            return
          }
          this.orderSelected.trm = res.trm;
          this.orderSelected.products = res.products;

          this.orderSelected.products.map((products: any, index: number) => {
            products.free_shipping = (products.free_shipping ? products.free_shipping : false);
            products.tax_manually = false; // Asignamos el valor del tax manual a automático.
            this.calculateTotalPrices(index);
            this.calculateDiscount(index);
            this.calculateTotalArticles();
            this.getFormula(index);
          });
        }
        this.isLoadingQuery = false;
      }, err => {
        this.isLoadingQuery = false;
        this._notify.show('Intenta mas tarde', 'No pudimos consultar la order', 'error');
        this.modalService.dismissAll();
        throw err;
      });
    if (this.status == 2 || this.status == 3) {
      this.disabledAllInputs = true;
    }
  }

  getFormula(position?: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      this.isLoadingFormula = true;
      this._orders.calculateShipping(this.orderSelected.products)
        .subscribe((res: any) => {
          this.orderSelected.shipping_value_admin = res;
          if (res[0].name === "No aplica") {
            this.orderSelected.products.map((product: any, i: number) => {// Mapeamos todos los productos
              product.tax = 0; // Volver el tax 0
              this.calculateTotalPrices(i); // Calculamos el total de prices
              this.calculateTotalArticles(); // Luego calculamos el total de los articulos
            });
          } else {
            this.calculateTotalPrices(position); // Calcular el total de precios
            this.calculateDiscount(position); // Calculamos el descuento
            this.calculateTotalArticles(); // Luego calculamos el total de los articulos
          }
          this.isLoadingFormula = false;
        }, err => {
          this.isLoadingFormula = false;
          throw err;
        });
    }
  }

  calculateWeightSubstract(i: number) {
    let product_weight = this.orderSelected.products[i].weight; //OBTAIN PRODUCT WEIGHT
    let product_quantity = this.orderSelected.products[i].quantity; //OBTAIN PRODUCT QUANTITY
    this.orderSelected.products[i].quantity = (product_quantity - 1); //SUBSTRACT 1 TO QUANTITY
    let unit_weight = (product_weight / product_quantity);// CALC WEIGHT FOR UNIT
    this.orderSelected.products[i].weight = parseFloat((product_weight - unit_weight).toFixed(2)); //SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateWeightAdd(i: number) {
    let product_weight = this.orderSelected.products[i].weight;//OBTAIN PRODUCT WEIGHT
    let product_quantity = this.orderSelected.products[i].quantity;//OBTAIN PRODUCT QUANTITY
    this.orderSelected.products[i].quantity = (product_quantity + 1);//SUBSTRACT 1 TO QUANTITY
    let unit_weight = (product_weight / product_quantity);// CALC WEIGHT FOR UNIT
    this.orderSelected.products[i].weight = parseFloat((product_weight + unit_weight).toFixed(2));//SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateTax(position?: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      if (this.orderSelected.products[position].free_shipping) { // Si el free_shipping es true

        this.orderSelected.products[position].tax = 0; // Volvemos el tax 0
      } else { // Si no calculamos el tax normalmente
        if (!this.orderSelected.products[position].tax_manually) { // Validar si el tax se calcula manual o automatico

          if (this.orderSelected.products[position].selected_tax == "1" || this.orderSelected.products[position].selected_tax == null) {

            this.orderSelected.products[position].tax = this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity * 0.07;
          } else {
            this.orderSelected.products[position].tax = ((this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity) + this.orderSelected.products[position].shipping_origin_value_product) * 0.07;
          }
        }
      }
    }
  }

  calculateTotalPrices(position: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      this.orderSelected.products[position].sub_total = this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity + this.orderSelected.products[position].tax;
    }
  }

  calculateDiscount(position: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      if (this.orderSelected.products[position].discount > 0) {
        this.orderSelected.products[position].discount = this.orderSelected.products[position].sub_total - this.orderSelected.products[position].sub_total * (this.orderSelected.products[position].discount / 100);
        this.orderSelected.products[position].discount = this.orderSelected.products[position].discount / 100
      }
    }
  }

  calculateTotalArticles() {
    var sub_total: number = 0;
    var total_weight: number = 0;
    this.orderSelected.products.map((product: any) => { sub_total += product.sub_total; total_weight += product.weight; });
    this.orderSelected.sub_total = sub_total;
    this.orderSelected.total_weight = total_weight;
  }

  changeCalculator(item: string, i: number) {
    this.orderSelected.products[i].tax_manually = false; // Setear que el tax_manually estará automatico
    this.orderSelected.products[i].selected_tax = item;
    this.calculateTax(i);
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }

  calculateTaxManually(i: number): void {
    this.orderSelected.products[i].tax_manually = true; // Setear que el tax_muanlly está manual
    this.calculateTotalPrices(i); // Calcular el total de precios
    this.calculateDiscount(i); // Calculamos el descuento
    this.calculateTotalArticles(); // Llamamos la función para obtener los valores totales
  }

  setPermanentShipping(i: number): void {
    this.getFormula(i);
  }

  deleteProduct(i: number): void {
    Swal.fire({
      title: '¿Estás seguro que deseas borrar el producto ' + this.orderSelected.products[i].name + '?',
      showDenyButton: true,
      confirmButtonText: 'Eliminar',
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._orders.deleteProduct(this.orderSelected.products[i].id)
          .subscribe((res: any) => {
            if (res) {
              this.orderSelected.products.splice(i, 1);
              this._notify.show('', res.message ? res.message : 'Has eliminado el producto correctamente.', 'success');
              this.calculateValuesInit();
            }
          }, err => {
            this._notify.show('', err.error ? err.error.message : 'Hemos tenido un error al intentar eliminar tu producto.', 'warning');
            throw err;
          });
      }
    });
  }

  numberOnly(event): boolean {  // Función para que sólo se permitan números en un input
    return numberOnly(event);
  }

  upadteImageByProduct(image) {
    this.productSelected.image = image;
  }

  openModal(product: any, modal: any, sizeModale: string) { //ITS ONLY FOR EDIT IMAGE
    if (this.status == 0 || this.status == 1 || this.status == 2) {
      this.productSelected = product;
      this.modalService.open(modal, { size: sizeModale, centered: true });
    }
  }

  sendQuotation() {
    // VALIDAMOS LOS CAMPOS QUE SON REQUERIDOS EN EL INPUT
    if (validateErrors(this.orderSelected.products, ['name', 'weight', 'product_value'])) {
      Swal.fire('Error', 'Campos requeridos incompletos', 'warning');
      return
    }
    this.isLoading = true;
    this._orders.updateOrder(this.orderSelected)
      .subscribe((res: any) => {
        this._notify.show("Cotización Actualizada", `Actualizaste la cotización # ${this.orderSelected.id}`, "success");
        this.isLoading = false;
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
      }, err => {
        this.isLoading = false;
        this._notify.show("Error", "Hemos tenido un error al intentar actualizar la orden.", "warning");
        throw err;
      });
  }

}
