import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService } from 'src/app/_services/users.service';
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

  public transactions: any = [];
  public referenceImage: any;
  public referenceStripeLink: any;
  public orderSelected: any;
  public transactionSelected: any;
  public term: any = '';

  public trm: number = 0;
  public status: number = 1;
  public count: number;
  public currentpage: number;

  public isLoading: boolean = false;
  public isLoadingTransaction: boolean = false;
  public submitted: boolean = false;
  public isIphone: boolean = false;

  public users: [] = [];

  // FILTROS
  public filterId = new FormControl('');
  public filterUser = new FormControl('');
  public filterOrder = new FormControl('');
  public filterPaymentMethod = new FormControl('null');
  public filterDate = new FormControl('');
  public filterPaymentGateway = new FormControl('');
  public filterReference = new FormControl('');
  public filterType = new FormControl('');
  public filterValue = new FormControl('');

  //SUBSCRIPCIONES PARA LOS AUTOCOMPLETS 
  public filteredUsers: Observable<string[]>;

  constructor(
    private modalService: NgbModal,
    private _transactionService: TransactionService,
    private _orderService: OrderService,
    private usersService: UserService
  ) { }

  ngOnInit() {
    this.checkOperativeSystem();
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];
    this.currentpage = 1;
    this.getTransactions(1);
    this.getUsers();
  }

  checkOperativeSystem() {
    if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
      if (document.cookie.indexOf("iphone_redirect=false") == -1) {
        this.isIphone = true;
      } else {
        this.isIphone = false;
      }
    }
  }

  getTransactions(status?: any, pagination?: any) {
    this.isLoading = true;
    this.status = (status ? status : 1);
    this._transactionService.getTransactionsFilterI({
      ...this.filterOptions(),
      status: status ? status : 1,
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
    }).subscribe(res => {
      this.transactions = res.transactions;
      this.count = res.count;
      this.isLoading = false;
      this.isLoading = false;
    }, err => {
      throw err;
    });
  }

  keyDownFunction(event: any) {
    if (this.isIphone) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        this.getTransactions();
      }
    } else {
      return;
    }
  }

  filterOptions() {
    const options = {};
    if (this.filterId.value != null && this.filterId.value != '') {
      options['id'] = this.filterId.value
    } if (this.filterUser.value != null && this.filterUser.value != '') {
      options['user'] = this.filterUser.value.id
    } if (this.filterOrder.value != null && this.filterOrder.value != '') {
      options['order'] = this.filterOrder.value
    } if (this.filterPaymentMethod.value != null && this.filterPaymentMethod.value != '' && this.filterPaymentMethod.value != 'null') {
      options['payment_method'] = this.filterPaymentMethod.value
    } if (this.filterDate.value?.year && this.filterDate.value != '') {
      options['created_at'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    } if (this.filterPaymentGateway.value != null && this.filterPaymentGateway.value != '') {
      options['payment_gateway'] = this.filterPaymentGateway.value
    } if (this.filterReference.value != null && this.filterReference.value != '') {
      options['reference'] = this.filterReference.value
    } if (this.filterType.value != null && this.filterType.value != '' && this.filterType.value != 'null') {
      options['type'] = this.filterType.value
    } if (this.filterValue.value != null && this.filterValue.value != '') {
      options['value'] = this.filterValue.value
    }
    return options;
  }

  resetFilters() {
    this.filterId.reset();
    this.filterUser.reset();
    this.filterOrder.reset();
    this.filterPaymentGateway.reset();
    this.filterPaymentMethod.reset();
    this.filterDate.reset();
    this.filterReference.reset();
    this.filterType.reset();
    this.filterValue.reset();
    this.getTransactions(this.status);
  }

  openModalOrderService(content: any, transaction: any) {
    this.transactionSelected = null;
    this.orderSelected = null;
    this.referenceStripeLink = null;
    this.transactionSelected = transaction;

    if (transaction.order_service) {
      this._orderService.detailOrder({ id: transaction.order_service }).subscribe(res => {
        this.orderSelected = res;
        this.modalService.open(content, { size: 'xl', centered: true });
      });
    } else {
      this._orderService.getShippingById({ id: transaction.shipping_order }).subscribe(res => {
        this.orderSelected = res;
        this.modalService.open(content, { size: 'xl', centered: true });
      });
    }

    if (transaction.image) {
      this.referenceImage = transaction.image;
    } else {
      this.referenceStripeLink = transaction.response;
      if (!transaction.image) {
        this.referenceImage = null;
      }
    }

  }

  updateTransaction(status: any) {
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

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
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
      this.count = res.count;
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      throw err;
    });
  }

  // CONSULTAMOS LOS USUARIOS PARA VISUALIZAR LOS CASILLEROS QUE TIENEN
  getUsers() {
    this.usersService.getUsersAdmin().subscribe(res => {
      this.users = res;
      //INICIALIZAMOS LA SUBSCRIPCION DE LOS FILTROS
      this.initialFilterdsSubscriptions();
    }, err => {
      throw err;
    });
  }

  initialFilterdsSubscriptions() {
    //HACEMOS UN FILTER CUANDO DETECTE CAMBIOS EL CONTROL DE "filterUserLocker" EVENTO QUE MANTIENE ESCUCHANDO CAMBIOS
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  //RECIBIMOS UN VALOR PARA FILTRAR
  //RECIBIMOS EL ARRAY AL QUE HAREMOS EL FILTRO
  _filter(value: string, array: any): string[] {
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue));
    if (fileterdData.length > 0) {
      return fileterdData;
    } else {
      return [];
    }
  }

  // VALIDAREMOS EL CAMPO EN EL OBJETO PARA FILTRAR EL VALOR EN EL ARRAY
  private _normalizeValue(value: any, array: any): string {
    // VALIDAMOS SI EL VALOR RECIVIDO ES UN OBJETO
    if (typeof value === 'object') {
      //VALIDAMOS EL ARRAY SI ES DE USUARIOS
      if (array === 'users') {
        if (value) {
          //FILTRAMOS POR EL LOCKER Y POR EL NOMBRE COMPLETO DEL USUARIO
          return 'CA' + value.locker_id + value.full_name.toLowerCase().replace(/\s/g, '');
        }
      }
    } else {
      // RETORNAMOS EL VALOR FORMATEADO PARA FILTRAR CUANDO NO VAMOS A CONSULTAR UN OBJETO
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

  paymentMethod(type: string) {
    switch (type) {
      case "credit":
        return "Crédito";
      case "transfer":
        return "Transferencia";
      case "wompi":
        return "Wompi";
      default:
        return "";
    }
  }

}