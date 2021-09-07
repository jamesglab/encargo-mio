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
  public productSelected: any;
  public subTotalPrice: number = 0;
  public totalPrice: number = 0;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public disabledInputs: boolean = false;
  public selectedTax: string = "1";
  public calculateTotal: any;
  public trm: { create_at: string, updated_at: string, id: number, value: number };

  constructor(
    private modalService: NgbModal,
    private _orderService: OrderService,
    public _notify: NotifyService
  ) { }

  ngOnInit() {
    this.getTRM();
  }

  ngOnChanges(){
    console.log(this.status);
  }

  getTRM() {
    this._orderService.getTRM().subscribe(res => { this.trm = res; });
  }

  openModal(order: any, content: any) {
    this.isLoading = true;
    this._orderService.detailOrder({ id: order.id }).subscribe((res) => {
      if (res) {
        this.productSelected = res;
        this.productSelected.trm = this.trm;
        this.modalService.open(content, { size: 'xl', centered: true });
      } else {
        this._notify.show('Error', 'No pudimos cargarcargar la orden.', 'warning');
      }
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }

  changeStatus(): void {
    this.disabledInputs = !this.disabledInputs;
  }

  changeCalculator(item: string, i: number) {
    this.selectedTax = item; // Cambiamos el tax a través de ícono
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }

  calculateTax(position: number) {
    let tax: number;
    if (this.selectedTax == '1') { // Si selecciona el 1 ícono
      tax = (this.productSelected.products[position].product_value * this.productSelected.products[position].quantity) * 0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.productSelected.products[position].tax = tax;
    } else {  // Si selecciona el 2 ícono
      tax = ((this.productSelected.products[position].product_value * this.productSelected.products[position].quantity) + this.productSelected.products[position].shipping_origin_value_product) * 0.07;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      this.productSelected.products[position].tax = tax;
    }
  }

  calculateTotalPrices(position: number) { // Calculamos el valor total aplicando la fórmula
    let subTotal: number;
    subTotal = (this.productSelected.products[position].product_value * this.productSelected.products[position].quantity) + this.productSelected.products[position].tax;
    subTotal.toString();
    subTotal = parseFloat(subTotal.toFixed(2));
    this.productSelected.products[position].sub_total = subTotal;
  }

  calculateDiscount(position: number) {
    let discount: number;
    discount = (this.productSelected.products[position].sub_total - (this.productSelected.products[position].sub_total) * (this.productSelected.products[position].discount / 100)); // Restamos el sub_total menos el sub_total multiplicado por el valor que ingresa el administrador dividido en 100
    this.productSelected.products[position].discount = (parseFloat((this.productSelected.products[position].discount / 100).toFixed(2))); // Restamos el subtotal menos el descuento para obtener el valor que se descuenta.
    this.productSelected.products[position].sub_total = (discount ? discount.toFixed(2) : 0);
  }

  getFormula(position: number) {
    this.isLoadingFormula = true;
    this.calculateTax(position); // Calculamos el tax
    this.calculateTotalPrices(position); // Calcular el total de precios
    this.calculateDiscount(position);
    this._orderService.calculateShipping(this.productSelected.products).subscribe((res) => { // Llamamos al método para calcular los valores de envío
      if (res.length > 0) { // Si el length de la respuesta es mayor a 0 
        this.calculateTotal = res[0]; // Asignamos el valor
        this.calculateTotal.shipping_usd = parseFloat((this.calculateTotal.total + this.calculateTotal.value).toFixed(2)); // Calculamos el costo de envío en USD
        this.calculateTotal.shipping_cop = parseFloat(((this.calculateTotal.total + this.calculateTotal.value) * this.trm.value).toFixed(0));// Calculamos el costo de envío en COP multiplicando el valor x el TRM
        this.productSelected.shipping_value = res[0].value;
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
    this._orderService.updateOrder(this.productSelected).subscribe((res) => {
      this._notify.show('Cotización Actualizada', `Actualizaste la cotización # ${this.productSelected.id}`, 'warning');
      this.isLoading = false;
      this.refreshTable.emit(true);
      this.modalService.dismissAll();
    }, err => {
      this.isLoading = false;
      this._notify.show('Error', 'Hemos tenido un error al intentar actualizar la orden.', 'warning');
      throw err;
    });

  }

}
