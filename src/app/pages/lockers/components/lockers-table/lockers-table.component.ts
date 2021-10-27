import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { UserService } from 'src/app/_services/users.service';
import { LockersService } from '../../_services/lockers.service';

@Component({
  selector: 'app-lockers-table',
  templateUrl: './lockers-table.component.html',
  styleUrls: ['./lockers-table.component.scss']
})

export class LockersTableComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Input() public lockers: any = [];
  public lockerSelected: any = {};

  // ALMACENAMOS OBJETOS PARA LOS SELECTORES
  public users: [] = [];

  //CREAMOS LOS CONTROLES PARA LOS INPUTS
  public filterUserLocker = new FormControl('');
  public filterGuide = new FormControl('');
  public filterProduct = new FormControl('');
  public filterStatus = new FormControl('');

  //SUBSCRIPCIONES PARA LOS AUTOCOMPLETS 
  public filteredUsers: Observable<string[]>;
  counts: any;

  //SERVICIOS Y DEMAS IMPORTACIONES
  constructor(
    public modalService: NgbModal,
    public lockerService: LockersService,
    public usersService: UserService
  ) { }

  ngOnInit(): void {
    this.getUsers();
    this.getAllLockers();
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
    const options = {};
    if (this.filterGuide.value != null && this.filterGuide.value != '') {
      options['guide_number'] = this.filterGuide.value
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
    return options
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
    this.filteredUsers = this.filterUserLocker.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }

  //ABRIMOS EL MODAL PARA VISUALIZAR EL PRODUCTO
  viewDetail(locker: any, modal: any, sizeModale: string) {
    this.lockerSelected = locker;
    this.modalService.open(modal, { size: sizeModale, centered: true });
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

}
