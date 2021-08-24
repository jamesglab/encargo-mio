import { Component, OnInit, Input } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderService } from "src/app/pages/ecommerce/_services/orders.service";
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
  public trm: number;
  constructor(
    private modalService: NgbModal,
    private _orderService: OrderService
  ) { }

  ngOnInit() {
    this.getTRM();
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(order, content: any) {
    this._orderService.detailOrder({ id: order.id }).subscribe((res) => {
      console.log("la orden es ", res);
      if (res){
        this.productSelected = res;
        this.modalService.open(content, { size: 'xl', centered: true });
      }else {
        Swal.fire("Error en la orden",'',"error")
      }
      
    });
  }

  getTRM() {
    this._orderService.getTRM().subscribe(res => {
      this.trm = res.value;
    })
  }

  calcTotalProducts() {
    this.productSelected.locker_value = 0;
    this.productSelected.total_value = 0;
    let totalProducts = 0
    this.productSelected.products.map((product, i) => {
      this.productSelected.locker_value = this.productSelected.locker_value + product.price.price_locker.usd;
      totalProducts = totalProducts + ((product.price.usd + product.price.tax) * product.quantity);
    });
    this.productSelected.total_value = totalProducts + this.productSelected.locker_value;

    // this.subTotalPrice = 0;
    // this.productSelected.order_service.estimated_value.usd = 0;
    // this.productSelected.order_service.products.map((item) => {
    //   const itemsubTotalPrice = item.quantity * item.price.usd;
    //   this.subTotalPrice = this.subTotalPrice + itemsubTotalPrice;
    // });
    // this.productSelected.order_service.estimated_value.usd = this.subTotalPrice;
  }
  sendQuotation() {
    let found = false;
    this.productSelected.products.map((item) => {
      if (item.price.usd == 0) {
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
      .updateOrder(this.productSelected)
      .subscribe((res) => {
        Swal.fire(
          "Cotización actualizada",
          `aprobaste la cotizacion  # ${this.productSelected.id}`,
          "success"
        );
        // this.modalService.dismissAll();
      });
  }
}
