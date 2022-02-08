import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly, validateErrors } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";
import { FileHandle } from "src/app/_directives/file-handle";
import { ImageCompressService } from "src/app/_services/image-compress.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-modal-order",
  templateUrl: "./modal-order.component.html",
  styleUrls: ["./modal-order.component.scss"],
})
export class ModalOrderComponent implements OnInit {

  @Output() public refreshTable = new EventEmitter<any>();

  public orderSelected: any = null;
  public status: any;

  public subTotalPrice: number = 0;
  public totalPrice: number = 0;

  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public disabledInputs: boolean = false;
  public disabledAllInputs: boolean = true;
  public isLoadingQuery: boolean = false;
  public isLoadingUpload: boolean = false;
  public isSafari: boolean = false;

  public productSelected: any;

  constructor(
    private _orders: OrderService,
    public _notify: NotifyService,
    public modalService: NgbModal,
    private _compress: ImageCompressService
  ) { }

  ngOnInit(): void {
    this.orderSelected.status = 5;
    this.checkIfSafari();
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

  ngOnChanges() {
    if (this.orderSelected) {
      this.calculateValuesInit();
    }
  }

  calculateValuesInit() {
    this.isLoadingQuery = true;
    this._orders.detailOrder({ id: this.orderSelected.id }).subscribe(
      (res: any) => {
        if (res) {
          this.orderSelected.trm = res.trm;
          this.orderSelected.shopper_images = res.shopper_images;
          this.orderSelected.products = res.products;
          this.orderSelected.products.map((product: any, index: number) => {
            product.real_value = product.product_value;
            product.name = product.name ? product.name.trim() : null;
            product.free_shipping = product.free_shipping
              ? product.free_shipping
              : false;
            product.tax_manually = false; // Asignamos el valor del tax manual a automático.
            this.calculateTotalPrices(index);
            this.calculateTotalArticles();
            this.getFormula(index);
            this.calculateDiscount(index);
          });
        }
        this.isLoadingQuery = false;
      },
      (err) => {
        this.isLoadingQuery = false;
        this._notify.show(
          "",
          "No pudimos consultar la orden, intenta de nuevo.",
          "error"
        );
        this.modalService.dismissAll();
        throw err;
      }
    );
    if (this.status == 2 || this.status == 3 || this.status == 5) {
      this.disabledAllInputs = true;
    }
  }

  getFormula(position: number) {
    return new Promise((resolve, reject) => {
      if (this.status == 0 || this.status == 1 || this.status == 7) {
        this.isLoadingFormula = true;
        this._orders.calculateShipping(this.orderSelected.products).subscribe(
          (res: any) => {
            this.orderSelected.shipping_value_admin = res;
            this.calculateTotalPrices(position); // Calcular el total de precios
            this.calculateDiscount(position); // Calculamos el descuento
            this.calculateTotalArticles(); // Luego calculamos el total de los articulos
            resolve("ok");
            this.isLoadingFormula = false;
          },
          (err) => {
            this.isLoadingFormula = false;
            reject(err);
            throw err;
          }
        );
      }
    });
  }

  calculateWeightSubstract(i: number) {
    let product_weight = this.orderSelected.products[i].weight; //OBTAIN PRODUCT WEIGHT
    let product_quantity = this.orderSelected.products[i].quantity; //OBTAIN PRODUCT QUANTITY
    this.orderSelected.products[i].quantity = product_quantity - 1; //SUBSTRACT 1 TO QUANTITY
    let unit_weight = product_weight / product_quantity; // CALC WEIGHT FOR UNIT
    this.orderSelected.products[i].weight = parseFloat(
      (product_weight - unit_weight).toFixed(2)
    ); //SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateWeightAdd(i: number) {
    let product_weight = this.orderSelected.products[i].weight; //OBTAIN PRODUCT WEIGHT
    let product_quantity = this.orderSelected.products[i].quantity; //OBTAIN PRODUCT QUANTITY
    this.orderSelected.products[i].quantity = product_quantity + 1; //SUBSTRACT 1 TO QUANTITY
    let unit_weight = product_weight / product_quantity; // CALC WEIGHT FOR UNIT
    this.orderSelected.products[i].weight = parseFloat(
      (product_weight + unit_weight).toFixed(2)
    ); //SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateTax(position?: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      if (this.orderSelected.products[position].free_shipping) {
        // Si el free_shipping es true
        this.orderSelected.products[position].tax = 0; // Volvemos el tax 0
      } else {
        // Si no calculamos el tax normalmente
        if (!this.orderSelected.products[position].tax_manually) {
          // Validar si el tax se calcula manual o automatico
          if (this.orderSelected.products[position].selected_tax == "1") {
            this.orderSelected.products[position].tax = parseFloat(
              (
                this.orderSelected.products[position].product_value *
                this.orderSelected.products[position].quantity *
                0.07
              ).toFixed(2)
            );
          } else if (
            this.orderSelected.products[position].selected_tax == "2"
          ) {
            this.orderSelected.products[position].tax = parseFloat(
              (
                (this.orderSelected.products[position].product_value *
                  this.orderSelected.products[position].quantity +
                  this.orderSelected.products[position]
                    .shipping_origin_value_product) *
                0.07
              ).toFixed(2)
            );
          }
        }
      }
    }
  }

  calculateTotalPrices(position: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      var sub_total: number = 0;
      sub_total =
        this.orderSelected.products[position].product_value *
        this.orderSelected.products[position].quantity +
        this.orderSelected.products[position].tax +
        this.orderSelected.products[position].shipping_origin_value_product;
      this.orderSelected.products[position].sub_total = sub_total;
    }
  }

  calculateDiscount(position: number) {
    if (this.status == 0 || this.status == 1 || this.status == 7) {
      if (this.orderSelected.products[position].discount > 0) {
        var discount: number = 0;
        discount =
          this.orderSelected.products[position].real_value *
          (this.orderSelected.products[position].discount / 100);
        this.orderSelected.products[position].product_value = (
          this.orderSelected.products[position].real_value - discount
        ).toFixed(2);
      }
    }
  }

  calculateTotalArticles() {
    var sub_total: number = 0;
    var total_weight: number = 0;
    this.orderSelected.products.map((product: any) => {
      sub_total += product.sub_total;
      total_weight += product.weight;
    });
    this.orderSelected.sub_total = sub_total;
    this.orderSelected.total_weight = total_weight
      ? parseFloat(total_weight.toFixed(2))
      : 0;
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

  taxOnChanges(i: number, event: any) {
    this.orderSelected.products[i].tax = event ? event : 0;
  }

  setPermanentShipping(i: number): void {
    this.getFormula(i);
  }

  validateShipping(i: number): void {
    if (!this.orderSelected.products[i].shipping_origin_value_product) {
      this.orderSelected.products[i].shipping_origin_value_product = 0;
    }
  }

  deleteProduct(i: number): void {
    Swal.fire({
      title:
        "¿Estás seguro que deseas borrar el producto " +
        this.orderSelected.products[i].name +
        "?",
      showDenyButton: true,
      confirmButtonText: "Eliminar",
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._orders.deleteProduct(this.orderSelected.products[i].id).subscribe(
          (res: any) => {
            if (res) {
              this.orderSelected.products.splice(i, 1);
              this._notify.show(
                "",
                res.message
                  ? res.message
                  : "Has eliminado el producto correctamente.",
                "success"
              );
              this.calculateValuesInit();
            }
          },
          (err) => {
            this._notify.show(
              "",
              err.error
                ? err.error.message
                : "Hemos tenido un error al intentar eliminar tu producto.",
              "warning"
            );
            throw err;
          }
        );
      }
    });
  }

  filesDropped(file: FileHandle[], position: number) {
    // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes("image")) {
      this._compress.compressImage(file[0].base64).then(
        (res: any) => {
          this.createFormData(res, position);
        },
        (err) => {
          this._notify.show(
            "",
            "Ocurrió un error al intentar cargar la imagen, intenta de nuevo.",
            "error"
          );
          throw err;
        }
      );
    } else {
      this._notify.show(
        "",
        "El archivo que seleccionaste no es una imagen.",
        "info"
      );
    }
  }

  createFormData(res: any, position: number) {
    const formData = new FormData();
    formData.append("image", res.file);
    formData.append(
      "payload",
      this.orderSelected.products[position].key_aws_bucket
    );
    this.isLoading = true;
    this.isLoadingUpload = true;
    this._orders.uploadNewImage(formData).subscribe(
      (res: any) => {
        this.orderSelected.products[position].image = res.Location;
        this.orderSelected.products[position].key_aws_bucket = res.Key;
        this.isLoadingUpload = false;
        this.isLoading = false;
      },
      (err) => {
        this.isLoadingUpload = false;
        this.isLoading = false;
        this._notify.show(
          "",
          "Ocurrió un error al intentar guardar la imagen, intenta de nuevo.",
          "error"
        );
        throw err;
      }
    );
  }

  uploadImage(position: number) {
    if (this.status == 2 || this.status == 3 || this.status == 5) {
      return;
    }
    this._compress.uploadImage().then(
      (res) => {
        this.createFormData(res, position);
      },
      (err) => {
        this._notify.show(
          "",
          "Ocurrió un error al intentar cargar la imagen, intenta de nuevo.",
          "error"
        );
        throw err;
      }
    );
  }

  numberOnly(event): boolean {
    // Función para que sólo se permitan números en un input
    return numberOnly(event, this.isSafari);
  }

  onImageError(event) {
    event.target.src = "assets/images/default.jpg";
  }

  upadteImageByProduct(image) {
    this.productSelected.image = image;
  }

  openModal(product: any, modal: any, sizeModale: string) {
    //ITS ONLY FOR EDIT IMAGE
    if (this.status == 0 || this.status == 1 || this.status == 2) {
      this.productSelected = product;
      this.modalService.open(modal, { size: sizeModale, centered: true });
    }
  }

  async sendQuotation() {
    if (
      validateErrors(this.orderSelected.products, [
        "name",
        "weight",
        "product_value",
      ])
    ) {
      Swal.fire("Error", "Campos requeridos incompletos", "warning");
      return;
    }
    this.isLoading = true;
    await this.getFormula(0);
    this._orders.updateOrder(this.orderSelected).subscribe(
      (res: any) => {
        this._notify.show(
          "Cotización Actualizada",
          `Actualizaste la cotización # ${this.orderSelected.id}`,
          "success"
        );
        this.isLoading = false;
        this.refreshTable.emit(true);
        this.modalService.dismissAll();
      },
      (err) => {
        this.isLoading = false;
        this._notify.show(
          "Error",
          "Hemos tenido un error al intentar actualizar la orden.",
          "warning"
        );
        throw err;
      }
    );
  }
}
