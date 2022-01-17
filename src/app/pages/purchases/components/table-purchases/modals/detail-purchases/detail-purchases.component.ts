import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { PurchaseService } from 'src/app/pages/purchases/_services/purchase.service';

@Component({
  selector: 'app-detail-purchases',
  templateUrl: './detail-purchases.component.html',
  styleUrls: ['./detail-purchases.component.scss']
})

export class DetailPurchasesComponent implements OnInit {

  @Input() public purchaseSelected: any = {};

  public purchase: any;

  public isLoading: boolean = false;

  constructor(
    private _purchases: PurchaseService,
    private _orders: OrderService,
    public modalService: NgbModal
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.purchaseSelected.order_service) {
      this.isLoading = true;
      this.getDetail().then(() => {
        this.getTransaction();
      });
    }
  }

  getDetail(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._orders.detailOrder({ id: this.purchaseSelected.order_service })
        .subscribe((res: any) => {
          this.purchase = res;
          resolve(this.purchase);
        }, err => {
          this.isLoading = false;
          reject(err);
          throw err;
        });
    });
  }

  getTransaction(): void {
    this._purchases.getTransactionByOrder(this.purchaseSelected.order_service)
      .subscribe((res: any) => {
        this.purchase.transaction = res;
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        throw err;
      });
  }

  onImageError(event: any) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

}
