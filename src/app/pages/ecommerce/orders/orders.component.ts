import { Component, OnInit } from "@angular/core";
import { OrderService } from "./_services/orders.service";
@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})

/**
 * Ecommerce orders component
 */
export class OrdersComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  term: any;
  public page = 1;
  public itemPerPage = 5;
  public transactions;
  public counts: number;

  constructor(private readonly _orderService: OrderService) { }

  ngOnInit() {
    this.getTransactions({ pageSize: 10, pageIndex: 0 })
  }
  getTransactions(pagination) {
    this._orderService
      .getQuotations({
        pageSize: pagination.pageSize,
        page: pagination.pageIndex + 1,
      })
      .subscribe((res) => {
        this.transactions = res.orders;
        this.counts = res.count;
      });
  }
}
