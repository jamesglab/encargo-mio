import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { FileHandle } from 'src/app/_directives/file-handle';
import { insertOnlyLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
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

  public selectedProductOrder: any = {};

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;
  public filteredOrders: Observable<string[]>;

  public actualDate: Date = new Date();

  constructor(
    public _fb: FormBuilder,
    private _notify: NotifyService,
    private _compress: ImageCompressService,
    private _orderService: OrderService,
    private _usersService: UserService,
    private _lockers: LockersService,
    public _cdr: ChangeDetectorRef,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkParamId();
    this.checkOperativeSystem();
  }

  checkParamId(): void {
    this.activatedRoute.queryParamMap.subscribe((params: any) => { this.params = params.params; });
    if (this.params.order_service) {
      this._orderService.getOrderPurchaseById(this.params.order_service).subscribe((res: any) => {
        if (res.order_purchase && res.order_purchase.length > 0) {
          this.buildForm();
          this.allOrders = [];
          this.allOrders = res.order_purchase;
          this.locker = res.locker_item;
          let filteredOrder = this.allOrders.filter(x => x.product.id == this.params.product);
          if (filteredOrder && filteredOrder.length > 0) {
            this.formInsertLocker.controls.order_service.setValue({ order_service: { id: filteredOrder[0].id }, product: { name: filteredOrder[0].product.name } });
            this.formInsertLocker.controls.order_service.disable();
            this.clickOrderItem(filteredOrder[0]);
          } else {
            this.formInsertLocker.controls.order_service.enable();
          }
          this.allOrders.map((item: any) => { item.order_service.user = { ...item.order_service.user, locker: res.locker_item }; });
          this.formInsertLocker.controls.user.setValue(res.locker_item);
        }
      }, err => {
        this.router.navigate(["/lockers/insert-in-locker"]);
        throw err;
      });
    } else {
      this.buildForm();
    }
  }

  buildForm(data?: any): void { // Creamos el formulario general.
    this.formInsertLocker = this._fb.group({
      guide_number: [data ? data.guide : null, [Validators.required]],
      user: [data ? data.user.locker : null, [Validators.required]],
      conveyor: [data ? data.conveyor : null, [Validators.required]],
      receipt_date: [{ year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }, [Validators.required]],
      order_service: [{ value: null, disabled: true }],
      products: this._fb.array([])
    });
    this.formInsertLocker.controls.user.disable();
    this.formInsertLocker.controls.conveyor.disable();
    this._cdr.detectChanges();
    this.getAllData();
    this.subscribeToData();
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
    if (typeof order === 'object' && order !== null) {
      for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
        this.removeItem(index);
      }
      this.selectedProductOrder = order;
      this.formInsertLocker.controls.guide_number.setValue({ guide_number: order.guide_number, guide_number_alph: order.guide_number_alph });
      this.formInsertLocker.controls.conveyor.setValue(order.conveyor);
      this.addItem(order);
    }
  }

  clickGuideItem(item: any): void {
    if (typeof item === 'object') {
      for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
        this.removeItem(index);
      }
      this.formInsertLocker.controls.user.setValue({ locker_id: item.locker.id, full_name: item.user.name + " " + item.user.last_name });
      this.formInsertLocker.controls.conveyor.setValue(item.conveyor);
      let data = {
        product: {
          name: item.product.name,
          permanent_shipping_value: item.product.permanent_shipping_value,
          quantity: item.product.quantity, image: item.product.image, force_commercial_shipping: (item.product.force_commercial_shipping ? item.product.force_commercial_shipping : false),
          images: item.product.images
        },
        product_price: item.product_price,
        order_service: item.order_service.id,
        weight: item.weight
      };
      this.selectedProductOrder = data;
      this.addItem(data);
    }
  }

  checkOperativeSystem() { // Checkeamos en que sistema operativo Safari I|OS o Chorme.
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        this.isAndroid = true; // Chrome
      } else {
        this.isAndroid = false; // Safari
      }
    }
  }

  createItem(item?: any): FormGroup { // Creamos el ítem del formulario dinámico
    let createItem = this._fb.group({
      product: [item ? (item.product?.id ? { id: item ? item.product?.id : null } : null) : null],
      name: [item ? item.product?.name : null, [Validators.required]],
      declared_value_admin: [item ? item.product_price : null, [Validators.required]],
      permanent_shipping_value: [item ? item.product?.permanent_shipping_value : null],
      quantity: [item ? item.product?.quantity : 1],
      weight: [item ? item.weight : null, [Validators.required]],
      force_commercial_shipping: [item ? item.product?.force_commercial_shipping : false],
      order_service: [item ? item.order_service?.id : null],
      images: [item.product?.images ? item.product.images : []],
      invoice_images: [item.product?.invoice ? item.product?.invoice : []],
      locker_observations: [null],
      client_observations: [null],
      novelty_article: [null],
      free_shipping: [false],
      loadingImage: [false],
      scrap_image: [item ? item.product?.image : null]
    });
    return createItem;
  }

  addItem(product?: any): void { // Método para pushear un nuevo ítem al arreglo de productos.
    this.products = this.formInsertLocker.get('products') as FormArray; // Igualamos el arreglo de productos al array products del FormArray
    this.products.push(this.createItem(product)); // Pusheamos un nuevo ítem al arreglo de productos.
  }

  removeItem(i: number): void { // Removemos un item de ingreso.
    this.products.value.splice(i, 1);
    this.products.controls.splice(i, 1);
  }

  addQuantity(i: number): void { // Añadir una cantidad al producto
    let actualQuantity: number = this.formInsertLocker.get('products')['controls'][i].controls.quantity.value;
    this.formInsertLocker.get('products')['controls'][i].controls.quantity.setValue(actualQuantity + 1);
  }

  substractQuantity(i: number): void { // Quitar una cantidad a un producto.
    let actualQuantity: number = this.formInsertLocker.get('products')['controls'][i].controls.quantity.value;
    if (actualQuantity > 1) {
      this.formInsertLocker.get('products')['controls'][i].controls.quantity.setValue(actualQuantity - 1);
    }
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

  filesDropped(file: FileHandle[], position: number, array: string) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {  // file = file del drop, i = posición de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
      this._compress.compressImage(file[0].base64).then((res: any) => {
        this.uploadImageToBucket(res, position, array);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImageLocally(position: number, array: string) {  // position = item dinámico del ingreso del arreglo, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this._compress.uploadImage().then((res: any) => {
      this.uploadImageToBucket(res, position, array);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  uploadImageToBucket(response: any, position: number, array: string): void {
    if (array === 'images') { // Images = se irá al endpoint de añadir una nueva imagen del producto
      this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(true);
      const formData = new FormData(); // Creamos un formData para enviarlo
      formData.append('images', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => {
        if (res.images) { // res.images es un arreglo
          for (let index = 0; index < res.images.length; index++) {
            this.products.controls[position]['controls'][array].value.push(res.images[index]); // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
          }
        }
        this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
      }, err => {
        this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen del producto, intenta de nuevo.', 'error');
        throw err;
      });
    } else { // invoice_images = se irá al endpoint de añadir una nueva imagen de factura.
      this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(true);
      const formDataInvoice = new FormData();  // Pusheamos la respuesta de la imagen comprimida en el formData
      formDataInvoice.append('invoice', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageInvoice(formDataInvoice).subscribe((res: any) => {
        if (res.invoice) { // res.invoice es un arreglo
          for (let index = 0; index < res.invoice.length; index++) { // recorremos el arreglo 
            this.products.controls[position]['controls'][array].value.push(res.invoice[index]); // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
          }
        }
        this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
      }, err => {
        this.formInsertLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen de la factura, intenta de nuevo.', 'error');
        throw err;
      });
    }
  }

  onRemoveImage(position: number, i: number, array: string) { // position = item dinámico del ingreso, i = posición de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this._lockers.deleteImage(this.products.controls[position]['controls'][array].value[i].Key)
      .subscribe(() => {
        this.products.controls[position]['controls'][array].value.splice(i, 1);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar eliminar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
  }

  onImageError(event: any) { // Cuando hay un error en alguna imagen se setea una imagen de una caja por defecto.
    event.target.src = "https://i.imgur.com/riKFnErh.jpg";
  }

  numberOnly($event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly($event, this.isAndroid);
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
        return value.full_name.toLowerCase().replace(/\s/g, '');
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
    return locker ? `CA${locker.locker_id} | ${locker.full_name}` : '';
  }

  displayGuides(guide: any): void {
    return guide ? guide.guide_number_alph : "";
  }

  displayOrder(order: any) {
    return order ? `${order.order_service.id} | ${order.product.name}` : '';
  }

  validatePushItems(): void { // Método para validar si el formulario es válido y añadir un nuevo ítem
    let actualQuantity: number = 0;
    for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
      actualQuantity += this.formInsertLocker.get('products')['controls'][index].value.quantity;
    }
    if (actualQuantity > this.selectedProductOrder.product?.quantity) {
      this._notify.show('', `Has superado la cantidad máxima de productos que puedes ingresar (${this.selectedProductOrder.product.quantity} máximo) y tu tienes (${actualQuantity} cantidades), revisa la cantidad de tus productos.`, 'info');
      return;
    } else {
      this.addItem(this.selectedProductOrder);// Llamar el método para añadir un nuevo item
    }
  }

  registerData(): void { // En este métodoentramos cuando ya el usuario hace clic para completar el ingreso.

    if (this.formInsertLocker.invalid) {
      this._notify.show('', 'Asegurate que hayas llenado todos los campos, antes de completar el ingreso.', 'info');
      return;
    }

    let actualQuantity: number = 0;
    for (let index = 0; index < this.formInsertLocker.get('products')['controls'].length; index++) {
      actualQuantity += this.formInsertLocker.get('products')['controls'][index].value.quantity;
    }
    if (actualQuantity > this.selectedProductOrder.product.quantity) {
      this._notify.show('', `Has superado la cantidad máxima de productos que puedes ingresar (${this.selectedProductOrder.product.quantity} máximo) y tu tienes (${actualQuantity} cantidades), revisa la cantidad de tus productos.`, 'info');
      return;
    }

    this.isLoading = true;

    let payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), this.params.order_service);
    this._lockers.insertInLockerWithout(payload)
      .subscribe(() => {
        this.isLoading = false;
        Swal.fire({
          title: '',
          text: "Se ha realizado el ingreso de los productos correctamente.",
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(["/lockers/locker"]);
          }
        });
      }, err => {
        this.isLoading = false;
        this._notify.show('', 'Ocurrió un error al intentar hacer el ingreso a casillero, intenta de nuevo.', 'error');
        throw err;
      });

  }

}