import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService } from 'src/app/_services/users.service';
import { LockersService } from '../../_services/lockers.service';

@Component({
  selector: 'app-users-products',
  templateUrl: './users-products.component.html',
  styleUrls: ['./users-products.component.scss']
})

export class UsersProductsComponent implements OnInit {

  public filterUser = new FormControl('');
  public filteredUsers: Observable<string[]>;

  public users: any[] = [];
  public products: any = [];

  public count: number = 0;

  public isLoading: boolean = false;
  public isEmpty: boolean = false;

  constructor(private usersService: UserService, private lockerService: LockersService) { }

  ngOnInit(): void {
    this.filteredUsers = this.filterUser.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    this.getUsers()
  }

  getUsers() {
    this.usersService.getUsersAdmin()
      .subscribe((res: any) => {
        this.users = res;
      }, err => {
        throw err;
      });
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

  filterProductsByUser(paginator?: any) {
    this.filterUser.disable();
    if (this.filterUser.value.locker_id) {
      this.isLoading = true;
      this.lockerService.getAllLockers({
        pageSize: paginator ? paginator.pageSize : 10,
        page: paginator ? paginator.pageIndex + 1 : 1,
        locker_id: this.filterUser.value.locker_id,
        status: 0
      }).subscribe((res: any) => {
        this.products = res.products;
        this.count = res.count;
        if (this.products.length === 0) { this.isEmpty = true; }
        this.isLoading = false;
        this.filterUser.enable();
        setTimeout(() => {
          this.isEmpty = false;
        }, 2000);
      }, err => {
        this.filterUser.enable();
        this.isLoading = false;
        throw err;
      });
    }
  }

  onImageError(event) {
    event.target.src = "assets/images/default.jpg";
  }

}
