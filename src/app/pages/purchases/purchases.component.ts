import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../ecommerce/_services/orders.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})

export class PurchasesComponent implements OnInit {

  public purchases: any;
  public purchaseSelected: any;
  public count;
  public filterValues: any = {};

  constructor(
    private _orderService: OrderService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getPurchases();
  }

  getPurchases(paginator?: any, filterValues?: any) {
    if (filterValues) {
      this.filterValues = filterValues;
    }
    this._orderService.getOrderPurchase({
      pageSize: paginator ? paginator.pageSize : 10,
      page: paginator ? paginator.pageIndex + 1 : 1,
      ...this.filterValues
    }).subscribe((res: any) => {
      this.purchases = res.orders_purchase;
      this.count = res.count;
    }, err => {
      throw err;
    });
  }

  receivePurchase(purchase, modal: any, sizeModale: string) {
    this.purchaseSelected = purchase
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }

  refreshTableReceive(event: boolean): void {
    if(event){
      this.getPurchases();
    }
  }

}
