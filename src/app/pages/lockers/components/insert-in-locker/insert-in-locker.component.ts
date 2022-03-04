import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { insertOnlyLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { UserService } from 'src/app/_services/users.service';
import { LockersService } from '../../_services/lockers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-insert-in-locker',
  templateUrl: './insert-in-locker.component.html',
  styleUrls: ['./insert-in-locker.component.scss']
})

export class InsertInLockerComponent implements OnInit {

  public formInsertLocker: FormGroup;
  public products: FormArray;

  public isAndroid: boolean = false;
  public isLoading: boolean = false;

  public params: any = {};
  public locker: any = {};

  public conveyors: any = [];
  public users: any = [];
  public allGuides: any = [];
  public allOrders: any = [];

  public order_has_products: any = [];
  public locker_has_product: any = [];

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;
  public filteredOrders: Observable<string[]>;

  public actualDate: Date = new Date();

  constructor(
    public _fb: FormBuilder,
    private _notify: NotifyService,
    private _orderService: OrderService,
    private _usersService: UserService,
    private _lockers: LockersService,
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
        if (res) {
          console.log(res);
          this.locker = res.income?.locker;
          this.buildForm(res);
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

    let buildFormPromise = new Promise((resolve, reject) => {
      this.formInsertLocker = this._fb.group({
        id: [data ? data.income?.id : null],
        guide_number: [data ? data.income.guide_number_alph : null],
        user: [data ? data.income.locker : null, [Validators.required]],
        conveyor: [data ? data.income.conveyor : null, [Validators.required]],
        receipt_date: [{ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }],
        order_service: [{ value: (data ? data.income.order_service : null), disabled: true }]
      });
      this.order_has_products = data.order_has_products;
      this.locker_has_product = data.locker_has_product;
      resolve(this.formInsertLocker);
      reject("error");
    });

    Promise.all([buildFormPromise]).then(() => { // Después de que se cumpla la promise
      this.getAllData(); // Obtenemos la respuesta de los conveyors y los users
      this.subscribeToData(); // No suscribimos a los cambios de los ítems del formulario.
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

  subscribeToData(): void {

    this.filteredOrders = this.formInsertLocker.controls.order_service.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'allOrders')));

    if (this.params.order_service) {
      this.formInsertLocker.controls.user.disable();
      return;
    }

    this.formInsertLocker.controls.user.valueChanges.subscribe((user: any) => {
      if (typeof user === 'object' && user !== null) {
        let type_id = user.id ? user.id : user.locker_id;
        this._orderService.getLockersByUser(type_id).subscribe((res: any) => {
          if (res && res.length > 0) {
            this.allOrders = [];
            this.allOrders = res;
          }
          this.formInsertLocker.controls.order_service.enable();
        }, err => {
          this.formInsertLocker.controls.order_service.disable();
          throw err;
        });
      }
    });

  }

  clickOrderItem(order: any) {
    // if (typeof order === 'object' && order !== null) {
    //   for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
    //     this.removeItem(index);
    //   }
    //   this.selectedProductOrder = order;
    //   this.formInsertLocker.controls.guide_number.setValue(order.guide_number_alph);
    //   this.formInsertLocker.controls.conveyor.setValue(order.conveyor);
    //   this.addItem(order);
    // }
  }

  clickGuideItem(item: any): void {
    // if (typeof item === 'object') {
    //   for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
    //     this.removeItem(index);
    //   }
    //   this.formInsertLocker.controls.user.setValue({ locker_id: item.locker.id, full_name: item.user.name + " " + item.user.last_name });
    //   this.formInsertLocker.controls.guide_number.setValue(item.guide_number);
    //   this.formInsertLocker.controls.conveyor.setValue(item.conveyor);
    //   let data = {
    //     product: {
    //       name: item.product.name,
    //       permanent_shipping_value: item.product.permanent_shipping_value,
    //       quantity: item.product.quantity,
    //       image: item.product.image,
    //       force_commercial_shipping: (item.product.force_commercial_shipping ? item.product.force_commercial_shipping : false),
    //       images: item.product.images
    //     },
    //     product_price: item.product_price,
    //     order_service: item.order_service.id,
    //     weight: item.weight
    //   };
    //   this.selectedProductOrder = data;
    //   this.addItem(data);
    // }
  }

  autoCompleteGuide(params: any): void {
    this._orderService.getDataByGuide(params)
      .subscribe((res: any) => { // Obtenemos los datos por los params de guía
        this.allGuides = [];
        this.allGuides = res;
        this._cdr.detectChanges();
      }, err => {
        throw err;
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
    return guide ? guide : "-";
  }

  displayOrder(order: any) {
    return order ? `${order}` : '';
  }

}