import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-modal-edit-order',
  templateUrl: './modal-edit-order.component.html',
  styleUrls: ['./modal-edit-order.component.scss']
})
export class ModalEditOrderComponent implements OnInit {
  @Input() orderSelected ; 
  @Input() trm ;
  @Output() refreshTable = new EventEmitter<any>();
  public subTotalPrice: number = 0;
  public totalPrice: number = 0;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public disabledInputs: boolean = false;
  public calculateTotal: number = 0; //TOTAL VALUE ARTICLES
  constructor(
    private _orderService: OrderService,
    public _notify: NotifyService,
    public modalService: NgbModal,

  ) { }

  ngOnInit(): void {
  }

  numberOnly(event): boolean {
    return numberOnly(event);
  } // Función para que sólo se permitan números en un input


  getFormula(position: number) {
    this.isLoadingFormula = true;
    this.calculateTax(position); // Calculamos el tax
    this.calculateTotalPrices(position); // Calcular el total de precios
    this.calculateDiscount(position);
    this.calculateTotalArticles();
    this._orderService.calculateShipping(this.orderSelected.products).subscribe(
      (res) => {
        // Llamamos al método para calcular los valores de envío
        if (res.length > 0) {
          // Si el length de la respuesta es mayor a 0
          this.orderSelected.shipping_value_admin = res;
          this.orderSelected.total_weight = res[0].weight;
        }
        this.isLoadingFormula = false;
      },
      (err) => {
        this.isLoadingFormula = false;
        throw err;
      }
    );
  }

  calculateTax(position: number) {
    let tax: number;
    if (this.orderSelected.products[position].selected_tax === "1") {
      // Si selecciona el 1 ícono
      tax =
        this.orderSelected.products[position].product_value *
        this.orderSelected.products[position].quantity *
        0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.orderSelected.products[position].tax = tax;
    } else {
      // Si selecciona el 2 ícono
      tax =
        (this.orderSelected.products[position].product_value *
          this.orderSelected.products[position].quantity +
          this.orderSelected.products[position].shipping_origin_value_product) *
        0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.orderSelected.products[position].tax = tax;
    }
  }

  calculateTotalArticles() {
    this.calculateTotal = 0;
    this.orderSelected.products.map((product) => {
      this.calculateTotal += product.product_value;
    });
  }

  calculateTotalPrices(position: number) {
    // Calculamos el valor total aplicando la fórmula
    let subTotal: number;
    subTotal =
      this.orderSelected.products[position].product_value *
      this.orderSelected.products[position].quantity +
      this.orderSelected.products[position].tax;
    subTotal.toString();
    subTotal = parseFloat(subTotal.toFixed(2));
    this.orderSelected.products[position].sub_total = subTotal;
  }

  calculateDiscount(position: number) {
    let discount: number;
    discount =
      this.orderSelected.products[position].sub_total -
      this.orderSelected.products[position].sub_total *
      (this.orderSelected.products[position].discount / 100); // Restamos el sub_total menos el sub_total multiplicado por el valor que ingresa el administrador dividido en 100
    this.orderSelected.products[position].discount = parseFloat(
      (this.orderSelected.products[position].discount / 100).toFixed(2)
    ); // Restamos el subtotal menos el descuento para obtener el valor que se descuenta.
    this.orderSelected.products[position].sub_total = discount
      ? discount.toFixed(2)
      : 0;
  }

  changeCalculator(item: string, i: number) {
    this.orderSelected.products[i].selected_tax = item;
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }
  sendQuotation() {
    this.isLoading = true;
    this._orderService.updateOrder(this.orderSelected).subscribe(
      (res) => {
        this._notify.show(
          "Cotización Actualizada",
          `Actualizaste la cotización # ${this.orderSelected.id}`,
          "warning"
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
