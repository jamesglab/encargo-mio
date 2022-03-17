import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { insertOnlyLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { UserService } from 'src/app/_services/users.service';
import Swal from 'sweetalert2';
import { LockersService } from '../../_services/lockers.service';

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
  public actualGuide: any = {};

  public conveyors: any = [];
  public users: any = [];
  public orders: any = [];
  public guides: any = [];

  public order_has_products: any = [];
  public locker_has_products: any = [];

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;
  public filteredOrders: Observable<string[]>;

  public actualDate: Date = new Date();

  public loadingOrderQuery: boolean = false;
  public getDataIncome: boolean = false;
  public shippingHome: any = { show: false, status: false };

  constructor(
    public _fb: FormBuilder,
    private _orderService: OrderService,
    private _usersService: UserService,
    public _lockers: LockersService,
    public _cdr: ChangeDetectorRef,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public _notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.checkParamId();
  }

  checkParamId(): void {

    this.activatedRoute.queryParamMap.subscribe((params: any) => { this.params = params.params; });
    this.loadingOrderQuery = true;

    if (this.params.order_service) {
      this.obtainOrderService(this.params.order_service);
    } else if (this.params.income) {

      this._orderService.getOrderServiceWithoutOrder(this.params.income).subscribe((res: any) => {
        if (res.income || res.locker_has_products.length > 0 || res.order_has_products.length > 0) {
          this.locker = res.income?.locker;
          this.shippingHome.status = res.income.shipping_to_locker;
          this.shippingHome.show = true;
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
        this.loadingOrderQuery = false;
      }, err => {
        this.loadingOrderQuery = false;
        this.router.navigate(["/lockers/insert-in-locker"]);
        throw err;
      });

    } else {
      this.loadingOrderQuery = false;
      this.buildForm();
    }

  }

  obtainOrderService(order_service: any): void {
    this.loadingOrderQuery = true;
    this._orderService.getOrderService(order_service).subscribe((res: any) => {
      if (res.income || res.locker_has_products.length > 0 || res.order_has_products.length > 0) {
        this.locker = res.income?.locker;
        this.shippingHome.status = res.income.shipping_to_locker;
        this.shippingHome.show = true;
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
      this.loadingOrderQuery = false;
    }, err => {
      this.loadingOrderQuery = false;
      this.router.navigate(["/lockers/insert-in-locker"]);
      throw err;
    });
  }

  buildForm(data?: any) { // Creamos el formulario general.
    let buildFormPromise = new Promise((resolve) => {
      this.formInsertLocker = this._fb.group({
        id: [data ? data.income?.id : null],
        guide_number: [data ? data.income?.guide_number_alph : null],
        user: [data ? data.income?.locker : null, [Validators.required]],
        conveyor: [data ? data.income?.conveyor : null],
        receipt_date: [{ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }],
        order_service: [{ value: (data ? data.income?.order_service : null), disabled: true }],
        shipping_to_locker: [data?.income?.shipping_to_locker]
      });
      if (!this.params.order_service || !this.params.income) {
        this.formInsertLocker.controls.user.disable();
      }
      if (data) {
        this.order_has_products = data.order_has_products;
        this.locker_has_products = data.locker_has_products;
      }
      resolve(this.formInsertLocker);
    });

    Promise.all([buildFormPromise]).then(() => { // Después de que se cumpla la promise
      this.getAllData(); // Obtenemos la respuesta de los conveyors y los users
    });
  }

  selectLocker(user: any): void {
    this.formInsertLocker.controls.user.disable();
    this.formInsertLocker.controls.order_service.disable();
    if (typeof user === 'object' && user != null) {
      this._orderService.getLockersByUser(user.id).subscribe((order: any) => {
        this.orders = order;
        this.filteredOrders = this.formInsertLocker.controls.order_service.valueChanges.pipe(startWith(''), map(value => this._filter(value, 'orders')));
        if (!this.params.order_service || !this.params.income) {
          this.formInsertLocker.controls.order_service.enable();
          return;
        }
        this.formInsertLocker.controls.order_service.disable();
      }, err => {
        this.formInsertLocker.controls.order_service.disable();
        throw err;
      });
    }
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
        if (this.params.order_service || this.params.income) {
          this.formInsertLocker.controls.order_service.disable();
          return;
        }
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

  selectedOrder(): void {

    if (this.formInsertLocker.controls.order_service.value !== null && this.formInsertLocker.controls.order_service.value !== "") {

      this.loadingOrderQuery = true;

      this._orderService.getOrderService(this.formInsertLocker.controls.order_service.value.id).subscribe((res: any) => {

        this.shippingHome.status = res.income.shipping_to_locker;
        this.shippingHome.show = true;

        if (res.income || res.locker_has_products.length > 0 || res.order_has_products.length > 0) {

          this.locker = res.income?.locker;
          this.formInsertLocker.controls.id.setValue(res.income?.id);
          if (!this.formInsertLocker.controls.guide_number) {
            this.formInsertLocker.controls.guide_number.setValue(res.income?.guide_number_alph);
          }
          this.formInsertLocker.controls.conveyor.setValue(res.income?.conveyor);
          this.formInsertLocker.controls.shipping_to_locker.setValue(res.income?.shipping_to_locker);
          this.formInsertLocker.controls.conveyor.setValue(res.income?.order_service);
          this.order_has_products = res?.order_has_products;
          this.locker_has_products = res?.locker_has_products;
          this.loadingOrderQuery = false;

          this.formInsertLocker.controls.order_service.disable();

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
        this.loadingOrderQuery = false;
        this.router.navigate(["/lockers/insert-in-locker"]);
        throw err;
      });

    }

  }

  clickGuideItem(item: any) {

    this.actualGuide = (item.guide_number_alph ? item.guide_number_alph : item);

    if (typeof item === 'object' && item !== null) {
      this.formInsertLocker.controls.guide_number.setValue(item.guide_number_alph);
      this.formInsertLocker.controls.user.setValue(item.locker);
      this.formInsertLocker.controls.order_service.setValue(item.order_service.id);
      this.formInsertLocker.controls.conveyor.setValue(item.conveyor);
    }

    this._lockers.getGuideIncome(this.actualGuide).subscribe((res: any) => {

      if (res.locker_has_products.length >= 0 || res.order_has_products.length >= 0) {
        this.order_has_products = null;
        this.locker_has_products = null;
        this.order_has_products = res?.order_has_products;
        this.locker_has_products = res?.locker_has_products;
        this.order_has_products.reverse();
        this.locker_has_products.reverse();
      } else if (res.locker_has_products.length === 0 && res.order_has_products.length === 0) {
        Swal.fire({
          title: '',
          text: "Lo sentimos no encontramos productos asociados a esta orden.",
          icon: 'info',
          showCancelButton: false,
          confirmButtonText: 'Ok'
        }).then((result) => {
          if (result.isConfirmed) {
            this.formInsertLocker.reset();
          }
        });
      }
    }, err => {
      throw err;
    });
  }

  autoCompleteGuide(params: any): void {
    this._orderService.getDataByGuide(params)
      .subscribe((res: any) => { // Obtenemos los datos por los params de guía
        this.guides = [];
        this.guides = res;
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
    if (value !== null) {
      if (typeof value === 'object') {
        if (array === 'conveyors') {
          return value.name.toLowerCase().replace(/\s/g, '');
        } else if (array === 'users') {
          return value.full_info.toLowerCase().replace(/\s/g, '');
        } else if (array === 'orders') {
          return value.id.toString();
        }
      } else {
        if (typeof value !== 'number') {
          return value.toLowerCase().replace(/\s/g, '');
        }
      }
    }
  }

  displayFn(option: any) { // Método para mostrar la data en elautocomplete de la transportadora.
    return option ? option.name : '';
  }

  displayLocker(locker: any) { // Método para mostrar la data en elautocomplete del locker o user.
    return locker ? locker.full_info : '';
  }

  displayOrderService(order: any) {
    return order?.id ? order.id : order;
  }

  displayGuides(guide: any): void {
    return guide ? guide : "";
  }

  onImageError(event: any) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

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

  resetAllForm(): void {
    if (this.params.order_service) {
      return;
    }
    this.shippingHome.status = false;
    this.shippingHome.show = false;
    this.formInsertLocker.controls.user.enable();
    this.formInsertLocker.reset();
    this.formInsertLocker.controls.receipt_date.setValue({ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() });
    this.order_has_products = [];
    this.locker_has_products = [];
    this.locker = null;
    this.actualGuide = null;
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

  refreshDataCanceledReceive(event: boolean) {
    if (event) {
      if (this.formInsertLocker.getRawValue().order_service) {
        let id = null;
        if (this.formInsertLocker.getRawValue().order_service.id) {
          id = this.formInsertLocker.getRawValue().order_service.id;
        } else {
          id = this.formInsertLocker.getRawValue().order_service;
        }
        this.obtainOrderService(id);
      }
    }
  }

  createMassive(): void {
    this.getDataIncome = true;
  }

  productsStatusReceive(event: any) {
    if (event) {
      for (let index = 0; index < event.product.length; index++) {
        let payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), this.order_has_products[index].order_service, [event.product[index]]);
        this.loadingOrderQuery = true;
        this._cdr.detectChanges();
        this._lockers.insertIncome(payload).subscribe((res: any) => {
          Swal.fire({
            title: '',
            text: "Se ha realizado el ingreso de los productos correctamente.",
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.isConfirmed) {
              if (!this.params.order_service || this.params.income) {
                this.router.navigate(["/lockers/locker"]);
              } else {
                this.loadingOrderQuery = false;
              }
            }
          });
        }, err => {
          this._cdr.detectChanges();
          this.loadingOrderQuery = false;
          this._notify.show('', 'Ocurrió un error al intentar hacer el ingreso a casillero, intenta de nuevo.', 'error');
          throw err;
        });
      }
    }

  }

}