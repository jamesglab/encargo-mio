import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs-compat';
import { map, startWith } from 'rxjs/operators';
import { UserService } from "src/app/_services/users.service";
import { RolesService } from '../_services/roles.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})

/**
 * Contacts user-list component
 */
export class UserlistComponent implements OnInit {
  // bread crumb items
  public users = [];
  public usersTable = [];
  public filterUser = new FormControl('');
  public filteredUsers: Observable<string[]>;
  public userSelected: any;
  public counts = 100;
  public roles = [];

  constructor(private _userService: UserService,
    private _roleService: RolesService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.getUsers();
    this.getUsersAdmin()
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
  }



  getUsersAdmin() {
    this._userService.getUsersAdmin().subscribe(res => {
      this.users = res;
    })
  }

  displayFnUserName(name: any) {
    return name ? `CA${name.locker_id} | ${name.name + ' ' + name.last_name}` : '';
  }

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


  getUsers(pagination?) {
    this._userService.getUsersAdminPaginate({
      pageSize: pagination?.pageSize ? pagination.pageSize : 10,
      page: pagination?.pageIndex ? pagination.pageIndex + 1 : 1,
    }).subscribe(res => {
      this.usersTable = res.users;
      this.counts = res.count
    });
  }

  getRoles() {
    this._roleService.getRoles().subscribe(res => {
      this.roles = res;
    })
  }

  openModal(content: any, user) {
    this.userSelected = user; this._userService.getUserById(user.id).subscribe(res => {
      this.userSelected = res
      this.modalService.open(content, { size: 'lg', centered: true });
    })
  }

  closeModal(modal) {
    modal.close('Close click');
    this.getUsers();
  }
}
