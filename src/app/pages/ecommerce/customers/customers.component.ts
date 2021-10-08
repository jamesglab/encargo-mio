import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OrderService } from '../_services/orders.service';
import { TransactionService } from '../_services/transactions.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})

export class CustomersComponent implements OnInit {

  public breadCrumbItems: Array<{}>;
  public submitted: boolean = false;
  public transactions: any = [];
  public referenceImage: any;
  public orderSelected: any;
  public transactionSelected: any;
  public term: any = '';
  public trm: number = 0;
  public status: number;
  public count: number;
  public currentpage: number;
  public isLoading: boolean = false;
  public isLoadingTransaction: boolean = false;

  constructor(
    private modalService: NgbModal,
    private _transactionService: TransactionService,
    private _orderService: OrderService
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];
    this.currentpage = 1;
    this.getTransactions(1);
  }

  getTransactions(status?, pagination?) {
    if (this.term != '') {
      this.isLoading = true;
      this.status = status;
      this._transactionService.getTransactionsFilter({
        status: status ? status : 1,
        pageSize: pagination?.pageSize ? pagination.pageSize : 10,
        page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1
      }).subscribe(res => {
        this.transactions = res.transactions;
        console.log("TRANSACTION: ", this.transactions);
        this.count = res.count;
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        throw err;
      });
    } else {
      this.searchFilter(status, pagination);
    }

  }

  openModalOrderService(content: any, transaction: any) {
    this.transactionSelected = transaction;
    this._orderService.detailOrder({ id: transaction.order_service }).subscribe(res => {
      this.orderSelected = res;
      this.modalService.open(content, { size: 'xl', centered: true });
    });
  }

  openModalReference(modale: any, transaction: any) {
    this.transactionSelected = transaction;
    if (transaction.image) {
      this.referenceImage = transaction.image.url;
      this.modalService.open(modale, { size: 'lg', centered: true })
    } else {
      window.open(transaction.response);
    }
  }

  updateTransaction(status) {
    this.isLoadingTransaction = true;
    this._transactionService.updateTransaction(this.transactionSelected, status)
      .subscribe(res => {
        Swal.fire('Transacción Actualizada', `La transacción fue actualizada.`, 'success');
        this.modalService.dismissAll();
        this.isLoadingTransaction = false;
        this.getTransactions();
      }, err => {
        Swal.fire('Error', `No pudimos actualizar la transacción.`, 'error');
        this.isLoadingTransaction = false;
        throw err;
      });
  }

  typeElement(type: string) {
    let isType: string = "";
    if (type == 'order_service') {
      isType = `Compra`;
    } else if (type == 'shipping_order') {
      isType = 'Envío';
    } else {
      return "-";
    }
    return isType;
  }

  searchFilter(status?, pagination?) {
    this.isLoading = true;
    this.status = status;
    this._transactionService.getTransactionsFilterI({
      status: status ? status : 1,
      filter: this.term,
      per_page: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1
    }).subscribe(res => {
      this.transactions = res.transactions;
      console.log("TRANSACTION: ", this.transactions);
      this.count = res.count;
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }
}
