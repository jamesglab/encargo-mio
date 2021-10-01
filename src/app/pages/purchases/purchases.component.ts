import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../ecommerce/_services/orders.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit {
  public purchases;
  public purchaseSelected;
  constructor(
    private _orderService: OrderService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getPurchases();
  }

  getPurchases() {

    this._orderService.getOrderPurchase().subscribe(res => {
      this.purchases = res;
    })

  }


  receivePurchase(purchase, modal: any, sizeModale: string) {
    this.purchaseSelected = purchase
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }

}
