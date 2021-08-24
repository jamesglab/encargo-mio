import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/_services/users.service';
import { OrderService } from '../_services/orders.service';

@Component({
  selector: 'app-orders-buys',
  templateUrl: './orders-buys.component.html',
  styleUrls: ['./orders-buys.component.scss']
})
export class OrdersBuysComponent implements OnInit {
  term: any;
  public page = 1;
  public itemPerPage = 5;
  public transactions;
  public counts: number;
  public status: number;
  public trm: number;
  public users = [];

  constructor(
    private readonly _orderService: OrderService,
    private _userService: UserService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getTransactions();
    this.getUsersAdmin();
  }
  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(users => {
      console.log('users', users);
      this.users = users;
    },err=>{
      console.log('error',err)
    })
  }

  getTransactions(pagination?) {
    this._orderService.getTRM().subscribe(res => {
      this.trm = res.value;
    })
    this._orderService
      .getQuotations({
        pageSize: pagination?.pageSize ? pagination.pageSize : 10,
        page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
        status: this.status ? this.status : '0',
        type :'purchase'
      })
      .subscribe((res) => {
        console.log("ORDERS RESPONSE", res);
        this.transactions = res.orders;
        this.counts = res.count;
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

}
