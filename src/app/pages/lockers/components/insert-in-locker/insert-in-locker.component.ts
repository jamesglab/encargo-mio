import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { UserService } from 'src/app/_services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-insert-in-locker',
  templateUrl: './insert-in-locker.component.html',
  styleUrls: ['./insert-in-locker.component.scss']
})

export class InsertInLockerComponent implements OnInit {

  public formInsertLocker: FormGroup;
  public products: any = [];

  public params: any = {};
  public locker: any = {};

  public conveyors: any = [];
  public users: any = [];

  public order_has_products: any = [];
  public locker_has_products: any = [];

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;

  public actualDate: Date = new Date();

  constructor(
    public _fb: FormBuilder,
    private _orderService: OrderService,
    private _usersService: UserService,
    public _cdr: ChangeDetectorRef,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkParamId();
  }

  checkParamId(): void {
    this.activatedRoute.queryParamMap.subscribe((params: any) => { this.params = params.params; });
    if (this.params.order_service) {
      this._orderService.getOrderService(this.params.order_service).subscribe((res: any) => {
        if (res.income || res.locker_has_products.length > 0 || res.order_has_products.length > 0) {
          this.locker = res.income?.locker;
          this.buildForm(res);
        } else if (res.locker_has_products.length === 0 && res.order_has_products.length === 0) {
          Swal.fire({
            title: '',
            text: "Lo sentimos no encontramos productos asociados a esta orden.",
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'Ok'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(["/lockers/insert-in-locker"]);
            }
          });
        }
      }, err => {
        this.router.navigate(["/lockers/insert-in-locker"]);
        throw err;
      });
    } else if (this.params.income) {
      this._orderService.getOrderServiceWithoutOrder(this.params.income).subscribe((res: any) => {
        if (res.income || res.locker_has_products.length > 0 || res.order_has_products.length > 0) {
          this.locker = res.income?.locker;
          this.buildForm(res);
        } else if (res.locker_has_products.length === 0 && res.order_has_products.length === 0) {
          Swal.fire({
            title: '',
            text: "Lo sentimos no encontramos productos asociados a esta orden.",
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'Ok'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(["/lockers/insert-in-locker"]);
            }
          });
        }
      }, err => {
        this.router.navigate(["/lockers/insert-in-locker"]);
        throw err;
      });
    } else {
      this.buildForm();
    }
  }

  buildForm(data?: any) { // Creamos el formulario general.
    let buildFormPromise = new Promise((resolve) => {
      this.formInsertLocker = this._fb.group({
        id: [data ? data.income?.id : null],
        guide_number: [data ? data.income?.guide_number_alph : null],
        user: [data ? data.income?.locker : null, [Validators.required]],
        conveyor: [data ? data.income?.conveyor : null, [Validators.required]],
        receipt_date: [{ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }],
        order_service: [{ value: (data ? data.income?.order_service : null), disabled: true }]
      });
      this.order_has_products = data?.order_has_products;
      this.locker_has_products = data?.locker_has_products;
      resolve(this.formInsertLocker);
    });
    Promise.all([buildFormPromise]).then(() => { // Después de que se cumpla la promise
      this.getAllData(); // Obtenemos la respuesta de los conveyors y los users
    });
  }

  get form() {
    return this.formInsertLocker.controls;
  }

  getAllData() { // Creamos un método que reuna dos llamados al backend: traer los conveyors, los users y creamos una promise para un mejor funcionamiento.

    let converyorsPromise = new Promise((resolve, reject) => {
      this._orderService.getConvenyor().subscribe((res: any) => {
        this.conveyors = res;
        this.formInsertLocker.controls.conveyor.enable();
        resolve(this.conveyors);
      }, err => {
        reject(err);
        throw err;
      });
    });

    let usersPromise = new Promise((resolve, reject) => {
      this._usersService.getUsersAdmin().subscribe((res: any) => {
        this.users = res;
        this.formInsertLocker.controls.user.enable();
        resolve(this.users);
      }, err => {
        reject(err);
        throw err;
      });
    });

    Promise.all([converyorsPromise, usersPromise]).then(() => { // Cuando se cumplan las dos peticiones se incia el método del filter
      this.filteredConveyors = this.formInsertLocker.controls.conveyor.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'conveyors')));
      this.filteredUsers = this.formInsertLocker.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'users')));
    });

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

  createItem(): FormGroup {
    let item = this._fb.group({
      product: [null],
      name: [null, [Validators.required]],
      declared_value_admin: [0, [Validators.required]],
      weight: [0, [Validators.required]],
      permanent_shipping_value: [0],
      quantity: [1],
      order_service: [null],
      images: [[]],
      invoice_images: [[]],
      description: [null],
      aditional_info: [null],
      force_commercial_shipping: [false],
      free_shipping: [false],
      scrap_image: [null],
      pending_quantity: [null]
    });
    return item;
  }

  addIncome(): void {
    this.products.push(this.createItem());
    this.order_has_products = this.products;
  }

  refreshDataRefresh(status: boolean) {
    if (status) {
      this.checkParamId();
    }
  }

}