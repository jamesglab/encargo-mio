import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs-compat';
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

  public users: [] = [];

  // FILTROS
  filterId = new FormControl('');
  filterUser = new FormControl('');
  filterOrder = new FormControl('');
  filterPaymentMethod = new FormControl('');
  filterDate = new FormControl('');
  filterPaymentGateway = new FormControl('');
  filterReference = new FormControl('');
  filterType = new FormControl('');
  filterValue = new FormControl('');


  //SUBSCRIPCIONES PARA LOS AUTOCOMPLETS 
  public filteredUsers: Observable<string[]>;

  constructor(
    private modalService: NgbModal,
    private _transactionService: TransactionService,
    private _orderService: OrderService,
    private usersService: UserService

  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];
    this.currentpage = 1;
    this.getTransactions(1);
    this.getUsers();
    
  }

  getTransactions(status?, pagination?) {
    console.log('filtramos')
    // if (this.term != '') {
      this.isLoading = true;
      this.status = status;
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
    // } else {
    //   this.searchFilter(status, pagination);
    // }
  }

  filterOptions() {
    console.log('estamos filtrando')
    const options = {}
    if (this.filterId.value != null && this.filterId.value != '') {
      options['id'] = this.filterId.value
    }if (this.filterUser.value != null && this.filterUser.value != '') {
      options['user'] = this.filterUser.value.id
    }if (this.filterOrder.value != null && this.filterOrder.value != '') {
      options['order'] = this.filterOrder.value
    }if (this.filterPaymentMethod.value != null && this.filterPaymentMethod.value != '') {
      options['payment_method'] = this.filterPaymentMethod.value
    }if (this.filterDate.value.year && this.filterDate.value != '') {
      options['created_at'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    } if (this.filterPaymentGateway.value != null && this.filterPaymentGateway.value != '') {
      options['payment_gateway'] = this.filterPaymentGateway.value
    } if (this.filterReference.value != null && this.filterReference.value != '') {
      options['reference'] = this.filterReference.value
    } if (this.filterType.value != null && this.filterType.value != '') {
      options['type'] = this.filterType.value
    }if (this.filterValue!=null  && this.filterValue.value!= ''){
      options['value'] = this.filterValue.value

    }

    return options
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
  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
    // return name ? `${name.name + ' ' + name.last_name}` : '';

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
        //FILTRAMOS POR EL LOCKER Y POR EL NOMBRE COMPLETO DEL USUARIO
        return 'CA' + value.locker_id + value.full_name.toLowerCase().replace(/\s/g, '');
      }
    } else {
      // RETORNAMOS EL VALOR FORMATEADO PARA FILTRAR CUANDO NO VAMOS A CONSULTAR UN OBJETO
      return value.toLowerCase().replace(/\s/g, '');
    }
  }


}


