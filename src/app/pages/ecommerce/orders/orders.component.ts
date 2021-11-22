import { Component, OnInit } from "@angular/core";
import { OrderService } from "../_services/orders.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from "src/app/_services/users.service";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})


export class OrdersComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  term: any;
  public page = 1;
  public itemPerPage = 5;
  public transactions;
  public counts: number;
  public status: number = 0;
  public trm: number;
  public users = [];
  public refreshTable: boolean = false;
  public isLoading: boolean = false;
  public filterValues: any = {};
  public counts_tabs: any = {};
  public showData: boolean = false;
  constructor(
    private readonly _orderService: OrderService,
    private _userService: UserService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getTransactions();
    this.getActualTrm();
    this.getUsersAdmin();
    this.countsTabs();
  }

  getUsersAdmin() {
    this._userService.getUsersAdmin()
      .subscribe((users: any) => {
        this.users = users;
      }, err => {
        throw err;
      });
  }

  countsTabs() {
    this._orderService.countsTabs()
      .subscribe((res: any) => {
        this.counts_tabs = res;
      }, err => {
        throw err;
      });
  }

  resetFilters() {
    this.filterValues = {};
    this.showData = false;
    this.getTransactions();
  }

  getActualTrm(): void {
    this._orderService.getTRM().subscribe((res: any) => {
      this.trm = res;
    }, err => {
      throw err;
    });
  }

  async getTransactions(pagination?: any, filterValues?: any) {

    if (filterValues) {
      this.filterValues = filterValues;
    }

    this.isLoading = true;

    await this._orderService.getQuotations({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
      status: this.status,
      ...this.filterValues
    }).subscribe((res) => {
      this.transactions = res.orders;
      this.counts = res.count;
      this.isLoading = false;
      this.showData = true;
    }, err => {
      this.isLoading = false;
      throw err;
    });

  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  refreshTableReceive(event): void {
    this.refreshTable = event;
    if (this.refreshTable) {
      this.getTransactions();
    }
  }

}
