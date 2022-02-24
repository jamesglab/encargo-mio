import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, startWith } from 'rxjs/operators';
import { UserService } from 'src/app/_services/users.service';
import { LockersService } from '../../_services/lockers.service';
import Swal from "sweetalert2";
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lockers-table',
  templateUrl: './lockers-table.component.html',
  styleUrls: ['./lockers-table.component.scss']
})

export class LockersTableComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Input() public lockers: any = [];

  @Input() public refreshTableStatus: boolean;

  public lockerSelected: any = {};

  // ALMACENAMOS OBJETOS PARA LOS SELECTORES
  public users: [] = [];

  //CREAMOS LOS CONTROLES PARA LOS INPUTS
  public filterUserLocker = new FormControl('');
  public filterGuide = new FormControl('');
  public filterOrderService = new FormControl('');
  public filterProduct = new FormControl('');
  public filterStatus = new FormControl('');
  public filterIdProduct = new FormControl('');
  public filterDate = new FormControl('');

  //SUBSCRIPCIONES PARA LOS AUTOCOMPLETS 
  public filteredUsers: Observable<string[]>;
  public counts: any;

  public isIphone: boolean = false;

  //SERVICIOS Y DEMAS IMPORTACIONES
  constructor(
    public modalService: NgbModal,
    public lockerService: LockersService,
    public usersService: UserService,
    public _router: Router
  ) { }

  ngOnInit(): void {
    this.getUsers();
    this.getAllLockers();
    this.checkOperativeSystem();
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

  ngOnChanges() {
    if (this.refreshTableStatus) {
      this.getAllLockers();
    }
  }

  keyDownFunction(event: any) {
    if (this.isIphone) {
      if (event.keyCode === 13) { // Si presiona el botón de intro o return en safari en IOS.
        this.getAllLockers();
      }
    } else {
      return;
    }
  }

  getAllLockers(pagination?: any) {
    this.lockerService.getAllLockers({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination?.pageIndex + 1 : 1,
      ...this.filterOptions()
    }).subscribe((res: any) => {
      this.lockers = res.products;
      this.counts = res.count;
    }, err => {
      throw err;
    });
  }

  //VALIDAMOS LOS FILTROS QUE ENVIAREMOS
  filterOptions() {
    const options: any = {};
    if (this.filterGuide.value != null && this.filterGuide.value != '') {
      options['guide_number'] = this.filterGuide.value
    }
    if (this.filterOrderService.value != null && this.filterOrderService.value.trim() != '') {
      options['order_service'] = this.filterOrderService.value;
    }
    if (this.filterProduct.value != null && this.filterProduct.value != '') {
      options['name'] = this.filterProduct.value
    }
    if (this.filterUserLocker.value != null && this.filterUserLocker.value != '') {
      options['locker_id'] = this.filterUserLocker.value.locker_id
    }
    if (this.filterStatus.value != null && this.filterStatus.value != '' && this.filterStatus.value != 'all') {
      options['status'] = this.filterStatus.value
    }
    if (this.filterIdProduct.value != null && this.filterIdProduct.value != '' && this.filterIdProduct.value != 'all') {
      options['product'] = this.filterIdProduct.value
    }
    if (this.filterDate.value && this.filterDate.value.year != '') {
      options['receipt_date'] = new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)
    }
    return options;
  }

  // CONSULTAMOS LOS USUARIOS PARA VISUALIZAR LOS CASILLEROS QUE TIENEN
  getUsers() {
    this.usersService.getUsersAdmin().subscribe((res: any) => {
      this.users = res;
      //INICIALIZAMOS LA SUBSCRIPCION DE LOS FILTROS
      this.initialFilterdsSubscriptions();
    }, err => {
      throw err;
    });
  }

  formatDate() {
    if (this.filterDate.value?.year) {
      return moment(new Date(this.filterDate.value.year, this.filterDate.value.month - 1, this.filterDate.value.day)).format('YYYY/MM/DD');
    } else {
      return '';
    }
  }

  initialFilterdsSubscriptions() {
    //HACEMOS UN FILTER CUANDO DETECTE CAMBIOS EL CONTROL DE "filterUserLocker" EVENTO QUE MANTIENE ESCUCHANDO CAMBIOS
    this.filteredUsers = this.filterUserLocker.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  viewDetail(locker: any, modal?: any) {
    this.lockerSelected = locker;
    if (this.lockerSelected.income) {
      this._router.navigate(["/lockers/update-locker"], { queryParams: { income: locker.income } });
    } else {
      this.modalService.open(modal, { size: 'xl', centered: true });
    }
  }

  closeModalEditLockers(event: any) {
    if (!event) {
      this.modalService.dismissAll();
      this.refreshTable.emit(true);
      this.getAllLockers();
    }
  }

  cancelModalReceive(event?: any) {
    this.modalService.dismissAll();
  }

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
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

  getStatusLocker(status: number): string {
    let statuses = {
      "0": "EN BODEGA",
      "1": "EN CONSOLIDACIÓN",
      "2": "ENVIADO",
      "3": "ENTREGADO"
    };
    return statuses[status] || statuses[0];
  }

  deleteProduct(product: any): void {
    if (product) {
      Swal.fire({
        title: '¿Estás seguro que deseas borrar el producto ' + product.product_name + '?',
        showDenyButton: true,
        confirmButtonText: 'Eliminar',
        denyButtonText: `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.usersService.deleteProductOnLocker(product.product)
            .subscribe((res: any) => {
              if (res) {
                Swal.fire('', 'El producto se ha eliminado el producto.', 'success');
                this.getAllLockers();
              }
            }, err => {
              Swal.fire('', 'Ha ocurrido un error al intentar borrar el producto.', 'warning');
              throw err;
            });
        }
      });
    } else {
      Swal.fire('', 'No has seleccionado un producto para borrar.', 'warning');
    }
  }

}
