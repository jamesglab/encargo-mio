import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
import { numberOnly } from "src/app/_helpers/tools/utils.tool";
import { NotifyService } from "src/app/_services/notify.service";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})

export class TransactionComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Input() public status: number;
  @Input() public transactions: Array<{
    id?: string;
    estimeted_value?: number;
    trm?: string;
    created_at?: string;
    updated_at?: string;
    is_shipping_locker?: boolean;
  }>;
  public orderSelected: any;
  public subTotalPrice: number = 0;
  public totalPrice: number = 0;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public disabledInputs: boolean = false;
  public calculateTotal: number = 0;//TOTAL VALUE ARTICLES
  public trm: { create_at: string, updated_at: string, id: number, value: number };

  constructor(
    private modalService: NgbModal,
    private _orderService: OrderService,
    public _notify: NotifyService
  ) { }

  ngOnInit() {
    this.getTRM();
  }

  getTRM() {
    this._orderService.getTRM().subscribe(res => { this.trm = res; });
  }

  openModal(order: any, content: any) {
    this.isLoading = true;
    this._orderService.detailOrder({ id: order.id }).subscribe((res) => {
      if (res) {
        this.modalService.open(content, { size: 'xl', centered: true });
        this.orderSelected = res;
        this.orderSelected.trm = this.trm;
        this.iterateData();
      } else {
        this._notify.show('Error', 'No pudimos pudimos la orden.', 'warning');
      }
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }

  iterateData() {
    for (let index = 0; index < this.orderSelected.products.length; index++) {
      this.orderSelected.products[index].free_shipping = (this.orderSelected.products[index].free_shipping ? this.orderSelected.products[index].free_shipping : false); // Volver el campo de free_shipping true y si viene null (false)
    }
  }

  changeCalculator(item: string, i: number) {
    this.orderSelected.products[i].selected_tax = item;
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }

  calculateTax(position: number) {
    let tax: number;
    if (this.orderSelected.products[position].selected_tax === '1') { // Si selecciona el 1 ícono
      tax = (this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity) * 0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.orderSelected.products[position].tax = tax;
    } else {  // Si selecciona el 2 ícono
      tax = ((this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity) + this.orderSelected.products[position].shipping_origin_value_product) * 0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.orderSelected.products[position].tax = tax;
    }
  }

  calculateTotalPrices(position: number) { // Calculamos el valor total aplicando la fórmula
    let subTotal: number;
    subTotal = (this.orderSelected.products[position].product_value * this.orderSelected.products[position].quantity) + this.orderSelected.products[position].tax;
    subTotal.toString();
    subTotal = parseFloat(subTotal.toFixed(2));
    this.orderSelected.products[position].sub_total = subTotal;
  }

  calculateDiscount(position: number) {
    let discount: number;
    discount = (this.orderSelected.products[position].sub_total - (this.orderSelected.products[position].sub_total) * (this.orderSelected.products[position].discount / 100)); // Restamos el sub_total menos el sub_total multiplicado por el valor que ingresa el administrador dividido en 100
    this.orderSelected.products[position].discount = (parseFloat((this.orderSelected.products[position].discount / 100).toFixed(2))); // Restamos el subtotal menos el descuento para obtener el valor que se descuenta.
    this.orderSelected.products[position].sub_total = (discount ? discount.toFixed(2) : 0);
  }

  getFormula(position: number) {
    this.isLoadingFormula = true;
    this.calculateTax(position); // Calculamos el tax
    this.calculateTotalPrices(position); // Calcular el total de precios
    this.calculateDiscount(position);
    this.calculateTotalArticles();
    this._orderService.calculateShipping(this.orderSelected.products).subscribe((res) => { // Llamamos al método para calcular los valores de envío
      if (res.length > 0) { // Si el length de la respuesta es mayor a 0 
        this.orderSelected.shipping_value_admin = res;
        this.orderSelected.total_weight = res[0].weight;
      }
      this.isLoadingFormula = false;
    }, err => {
      this.isLoadingFormula = false;
      throw err;
    });
  }

  numberOnly(event): boolean { return numberOnly(event); } // Función para que sólo se permitan números en un input

  sendQuotation() {
    this.isLoading = true;
    this._orderService.updateOrder(this.orderSelected).subscribe((res) => {
      this._notify.show('Cotización Actualizada', `Actualizaste la cotización # ${this.orderSelected.id}`, 'warning');
      this.isLoading = false;
      this.refreshTable.emit(true);
      this.modalService.dismissAll();
    }, err => {
      this.isLoading = false;
      this._notify.show('Error', 'Hemos tenido un error al intentar actualizar la orden.', 'warning');
      throw err;
    });

  }

  //VALOR ARTICULOS
  calculateTotalArticles() {
    this.calculateTotal = 0;
    this.orderSelected.products.map((product) => {
      this.calculateTotal += product.product_value;
    })
  }

}
