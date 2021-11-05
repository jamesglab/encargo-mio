import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../_services/orders.service';

@Component({
  selector: 'app-orders-shippings',
  templateUrl: './orders-shippings.component.html',
  styleUrls: ['./orders-shippings.component.scss']
})

export class OrdersShippingsComponent implements OnInit {

  public term: any;
  public page = 1;
  public itemPerPage = 5;
  public shippings;
  public counts: any = {};
  public status: number = 0;
  public count: number = 0;
  public trm: any;
  public users = [];
  public shippingToUpdate;
  public isLoading: boolean = false;
  public shippingTracking: any;

  constructor(
    private readonly _orderService: OrderService,
    private _userService: UserService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getTransactions();
    this.getUsersAdmin();
    this.getTRM();
    this.getCountsTabs();
  }

  getCountsTabs() {
    this._orderService.countsTabsShipping().subscribe(res => {
      this.counts = res;
    })
  }

  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe((users: any) => {
      this.users = users;
    }, err => {
      throw err;
    });
  }

  getTRM() {
    this._orderService.getTRM().subscribe(res => {
      this.trm = res;
    });
  }

  getTransactions(pagination?) {
    this.isLoading = true;
    this._orderService.getAllShippings({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      status: this.status ? this.status : '0',
    }).subscribe((res) => {
      this.shippings = res.shipping_orders;
      this.shippings = res.shipping_orders;
      this.count = res.count;
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }

  openModal(modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }

  updateShipping() { }

}
