import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { UserService } from 'src/app/_services/users.service';
import { LockersService } from '../../_services/lockers.service';

@Component({
  selector: 'app-insert-by-guide',
  templateUrl: './insert-by-guide.component.html',
  styleUrls: ['./insert-by-guide.component.scss']
})

export class InsertByGuideComponent implements OnInit {

  public formInsertByGuide: FormGroup;

  public order_has_products: any = [];
  public locker_has_products: any = [];
  public conveyors: any = [];
  public users: any = [];
  public allGuides: any = [];

  public actualGuide: any = {};

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;

  public actualDate: Date = new Date();

  constructor(
    public _fb: FormBuilder,
    private _orderService: OrderService,
    private _usersService: UserService,
    public _lockers: LockersService,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.formInsertByGuide = this._fb.group({
      id: [null],
      guide_number: [null],
      user: [null, [Validators.required]],
      conveyor: [null, [Validators.required]],
      order_service: [{ value: null, disabled: true }],
      receipt_date: [{ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }],
    });
    this.getAllData();
  }

  get form() {
    return this.formInsertByGuide.controls;
  }

  getAllData() { // Creamos un método que reuna dos llamados al backend: traer los conveyors, los users y creamos una promise para un mejor funcionamiento.

    let converyorsPromise = new Promise((resolve, reject) => {
      this._orderService.getConvenyor().subscribe((res: any) => {
        this.conveyors = res;
        this.formInsertByGuide.controls.conveyor.enable();
        resolve(this.conveyors);
      }, err => {
        reject(err);
        throw err;
      });
    });

    let usersPromise = new Promise((resolve, reject) => {
      this._usersService.getUsersAdmin().subscribe((res: any) => {
        this.users = res;
        this.formInsertByGuide.controls.user.enable();
        resolve(this.users);
      }, err => {
        reject(err);
        throw err;
      });
    });

    Promise.all([converyorsPromise, usersPromise]).then(() => { // Cuando se cumplan las dos peticiones se incia el método del filter
      this.filteredConveyors = this.formInsertByGuide.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));
      this.filteredUsers = this.formInsertByGuide.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    });

  }

  autoCompleteGuide(params: any): void {
    this.disableItems(true);
    this._orderService.getDataByGuide(params)
      .subscribe((res: any) => { // Obtenemos los datos por los params de guía
        this.allGuides = [];
        this.allGuides = res;
        this._cdr.detectChanges();
        this.disableItems(false);
      }, err => {
        this.disableItems(false);
        throw err;
      });
  }

  clickGuideItem(item: any) {
    console.log(item);
    this.actualGuide = item.guide_number;
    if (typeof item === 'object' && item !== null) {
      this.formInsertByGuide.controls.user.setValue(item.locker);
      this.formInsertByGuide.controls.order_service.setValue(item.order?.id);
      this.formInsertByGuide.controls.conveyor.setValue(item.conveyor?.id);
    }

    this.disableItems(true);
    this._lockers.getGuideIncome(this.actualGuide).subscribe((res: any) => {
      if (res) {
        this.order_has_products = res?.order_has_products;
        this.locker_has_products = res?.locker_has_products;
      }
      this.disableItems(false);
    }, err => {
      this.disableItems(false);
      throw err;
    });
  }

  disableItems(status: boolean): void {
    if (status) {
      this.formInsertByGuide.controls.guide_number.disable();
      this.formInsertByGuide.controls.user.disable();
      this.formInsertByGuide.controls.conveyor.disable();
    } else {
      this.formInsertByGuide.controls.guide_number.enable();
      this.formInsertByGuide.controls.user.enable();
      this.formInsertByGuide.controls.conveyor.enable();
    }
  }

  _filter(value: string, array: any): string[] { // Método que usa el filtro del material autocomplete
    const filterValue = this._normalizeValue(value, array);
    let filterData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue)); // Simplemente filtramos los valores incluyendo lo que el usuario escribe (filterValue)
    if (filterData.length > 0) { // Si filteredData retorna más de 1 valor entonces retornamos la data al autocomplete
      return filterData;
    } else {
      return this[array];
    }
  }

  _normalizeValue(value: any, array: any): string { // Método para normalizar el valor del autocomplete convirtiéndolo en minúscula.
    if (typeof value === 'object' && value !== null) {
      if (array === 'conveyors') {
        return value.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value.full_info.toLowerCase().replace(/\s/g, '');
      } else if (array === 'allOrders') {
        if (value.product && value.product.name) {
          return value.product.name.toLowerCase().replace(/\s/g, '');
        } else {
          return "";
        }
      }
    } else {
      if (value) {
        return value.toLowerCase().replace(/\s/g, '');
      }
    }
  }

  displayFn(option: any) { // Método para mostrar la data en elautocomplete de la transportadora.
    return option ? option.name : '';
  }

  displayLocker(locker: any) { // Método para mostrar la data en elautocomplete del locker o user.
    return locker ? locker.full_info : '';
  }

  displayGuides(guide: any): void {
    return guide ? guide.guide_number_alph : "";
  }

  displayOrder(order: any) {
    return order ? order : '';
  }

  addIncome() {

  }

  refreshDataRefresh(data: boolean) {
    if (data) {
      this.clickGuideItem(this.actualGuide);
    }
  }

}
