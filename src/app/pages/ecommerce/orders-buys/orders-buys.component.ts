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

  public term: any;
  public transactions: any;

  public page: number = 1;
  public itemPerPage: number = 5;
  public counts: number;
  public status: number;
  public trm: number;

  public users: any = [];

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
    this._userService.getUsersAdmin()
      .subscribe((users: any) => {
        this.users = users;
      }, err => {
        throw err;
      });
  }

  getTransactions(pagination?: any) {

    this._orderService.getTRM()
      .subscribe((res: any) => {
        this.trm = res.value;
      });

    this._orderService.getQuotations({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      status: this.status ? this.status : '0',
      type: 'purchase'
    }).subscribe((res: any) => {
      this.transactions = res.orders;
      this.counts = res.count;
    }, err => {
      throw err;
    });
    
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

}
