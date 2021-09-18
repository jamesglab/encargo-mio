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

  term: any;
  public page = 1;
  public itemPerPage = 5;
  public transactions;
  public counts: number;
  public status: number = 0;
  public trm: any;
  public users = [];
  public shippingToUpdate ;
  constructor(
    private readonly _orderService: OrderService,
    private _userService: UserService,
    private modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.getTransactions();
    this.getUsersAdmin();
  }
  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(users => {
      this.users = users;
    }, err => {
      console.log('error', err)
    })
  }

  getTransactions(pagination?) {

    this._orderService.getTRM().subscribe(res => {
      this.trm = res;
    })
    this._orderService
      .getAllShippings({
        pageSize: pagination?.pageSize ? pagination.pageSize : 10,
        page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
        status: this.status ? this.status : '0',
      })
      .subscribe((res) => {
        this.transactions = res.shipping_orders;
        this.counts = res.count;
      });
  }

  openModal(modal: any, sizeModale: string) {
    this.modalService.open(modal, { size: sizeModale, centered: true });
  }


  updateShipping() {

    
  }

}
