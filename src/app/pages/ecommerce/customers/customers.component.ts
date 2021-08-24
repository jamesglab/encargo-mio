import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OrderService } from '../_services/orders.service';
import { TransactionService } from '../_services/transactions.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})

/**
 * Ecomerce Customers component
 */
export class CustomersComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;
  formData: FormGroup;
  submitted = false;
  transactions = [];
  referenceImage: any;
  orderSelected: any;
  transactionSelected: any;
  term: any;
  trm = 0;
  status: number;
  count : number;

  // page
  currentpage: number;

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private _transactionService: TransactionService,
    private _orderService: OrderService

  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];

    this.formData = this.formBuilder.group({
      username: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      address: ['', [Validators.required]],
      balance: ['', [Validators.required]]
    });

    this.currentpage = 1;

    /**
     * Fetches the data
     */
    this.getTransactions(2);
  }


  /**
   * Transactions data fetches
   */
  getTransactions(status?, pagination?) {
    this.status = status;
    this._transactionService.getTransactionsFilter({
      status: status ? status : 2,
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,

    }).subscribe(res => {
      this.transactions = res.transactions;
      this.count = res.count;
    })
  }

  get form() {
    return this.formData.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModalOrderService(content: any, transaction) {

    this._orderService.detailOrder({ id: transaction.order_service }).subscribe(res => {
      this.orderSelected = res;
      this.modalService.open(content, { size: 'xl', centered: true });
    })
  }
  openModalReference(modale, transaction) {
    this.transactionSelected = transaction;
    if (transaction.image) {
      this.referenceImage = transaction.image.url;

      this.modalService.open(modale, { size: 'lg', centered: true })
    } else {
      window.open(transaction.response)
    }

  }
  saveCustomer() {
    const currentDate = new Date();
    if (this.formData.valid) {
      const username = this.formData.get('username').value;
      const email = this.formData.get('email').value;
      const phone = this.formData.get('phone').value;
      const address = this.formData.get('address').value;
      const balance = this.formData.get('balance').value;

      this.transactions.push({
        id: this.transactions.length + 1,
        username,
        email,
        phone,
        address,
        balance,
        rating: '4.3',
        date: currentDate + ':'
      })
      this.modalService.dismissAll()
    }
    this.submitted = true
  }
  updateTransaction(status) {
    this._transactionService.updateTransaction(this.transactionSelected.id, status).subscribe(res => {
      Swal.fire('Transaccion actualizada', `La transacción quedo ${res.status == 1 ? 'Aprobada' : 'Rechazada'}`, 'success');
      this.modalService.dismissAll();
    })
  }
}
