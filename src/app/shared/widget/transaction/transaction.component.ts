import { Component, OnInit, Input } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/orders/_services/orders.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})
export class TransactionComponent implements OnInit {
  @Input() transactions: Array<{
    id?: string;
    estimeted_value?: number;
    trm?: string;
    created_at?: string;
    updated_at?: string;
    is_shipping_locker?: boolean;
  }>;
  productSelected;
  subTotalPrice = 0;
  totalPrice = 0;
  trm = 30;

  constructor(
    private modalService: NgbModal,
    private _orderService: OrderService
  ) { }

  ngOnInit() { }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(order, content: any) {
    this._orderService.detailOrder({ id: order.id }).subscribe((res) => {
      console.log("la orden es ", res);
      this.productSelected = res[0];
      this.productSelected.order_service.estimated_value = parseInt(this.productSelected.order_service.estimated_value);
      this.modalService.open(content, { centered: true });
    });
  }

  calcTotalProducts() {
    this.subTotalPrice = 0;
    this.productSelected.order_service.estimated_value = 0;
    this.productSelected.order_service.products.map((item) => {
      const itemsubTotalPrice = item.quantity * item.price;
      this.subTotalPrice = this.subTotalPrice + itemsubTotalPrice;
    });
    this.productSelected.order_service.estimated_value = this.subTotalPrice + this.trm
  }
  sendQuotation() {
    let found = false;
    this.productSelected.order_service.products.map((item) => {
      if (item.price == 0) {
        found = true;
      }
    });
    if (found)
      Swal.fire(
        "Verifica el precio de los productos",
        "uno o varios productos no tienen precio",
        "error"
      );
    this._orderService
      .updateOrder(this.productSelected.order_service)
      .subscribe((res) => {
        Swal.fire(
          "Cotización actualizada",
          `aprobaste la cotizacion  # ${this.productSelected.order_service.id}`,
          "success"
        );
        this.modalService.dismissAll();
      });
  }
}
