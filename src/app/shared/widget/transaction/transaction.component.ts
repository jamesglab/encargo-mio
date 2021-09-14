import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
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
  public isLoading: boolean = false;
  public trm: {
    create_at: string;
    updated_at: string;
    id: number;
    value: number;
  };

  constructor(
    private modalService: NgbModal,
    private _orderService: OrderService,
    public _notify: NotifyService
  ) { }

  ngOnInit() {
    this.getTRM();
  }

  getTRM() {
    this._orderService.getTRM().subscribe((res) => {
      this.trm = res;
    });
  }

  // METODO QUE ABRE EL DIFERENTES MODALS DEPENDIENTO EL CONTENT
  // ORDER = ORDEN QUE SELECCIONA EL USUARIO
  // MODALE = OPCION QUE SE LE MOSTRARA DEPENDIENDO DE LA ESTADO DE LA ORDEN 
  // SIZE TAMAÑO DINAMICO AL CAMBIAR DE MODALES
  openModal(order: any, modal: any, sizeModale: string) {
    // PONEMOS LA BANDERA DEL LOADER PARA EVITAR MULTIPLEX CONSULTAS
    this.isLoading = true;
    // CONSULTAMOS LA ORDEN DEPENTEINDO DEL ID CONSUMIMOS ENDPOINT QUE NOS DA ORDEN CON PRODUCTOS
    this._orderService.detailOrder({ id: order.id }).subscribe(
      (res) => {
        if (res) {
          // ABRIMOS EL MODALE Y LE DAMOS LOS VALORES DE TAMAÑO Y CENTRADO
          this.modalService.open(modal, { size: sizeModale, centered: true });
          // CREAMOS LA RESPUESTA Y PONEMOS LA ORDEN EN LA VARIABLE orderSelected QUE CONTIENE LA ORDEN Y LOS PRODUCTOS
          this.orderSelected = res;
          // ASIGNAMOS LA TRM ACTUAL QUE FUE CONSULTADA
          this.orderSelected.trm = this.trm;
          // ASIGNAMOS LA TRM ACTUAL A LA COTIZACIÓN
          this.iterateData();
        } else {
          this._notify.show("Error", "No pudimos obtener la orden.", "warning");
        }
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        throw err;
      }
    );
  }

  iterateData() {
    for (let index = 0; index < this.orderSelected.products.length; index++) {
      this.orderSelected.products[index].free_shipping = this.orderSelected
        .products[index].free_shipping
        ? this.orderSelected.products[index].free_shipping
        : false; // Volver el campo de free_shipping true y si viene null (false)
    }
  }
}
