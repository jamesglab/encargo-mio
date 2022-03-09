import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { FileHandle } from 'src/app/_directives/file-handle';
import { insertOnlyLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { numberOnly } from 'src/app/_helpers/tools/utils.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
import { NotifyService } from 'src/app/_services/notify.service';
import { LockersService } from '../../_services/lockers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-locker-update',
  templateUrl: './locker-update.component.html',
  styleUrls: ['./locker-update.component.scss']
})

export class LockerUpdateComponent implements OnInit {

  public params: any = {};
  public selectedProductOrder: any = {};
  public firstProductSelected: any = {};

  public allGuides: any = [];
  public conveyors: any = [];
  public users: any = [];
  public products: FormArray;

  public formUpdateLocker: FormGroup;

  public actualDate: Date = new Date();

  public isLoading: boolean = false;
  public isAndroid: boolean = false;

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;
  public filteredOrders: Observable<string[]>;

  constructor(
    public router: Router,
    public _fb: FormBuilder,
    public _cdr: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    public _notify: NotifyService,
    public _compress: ImageCompressService,
    private _lockers: LockersService,
    private _orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.checkOperativeSystem();
    this.checkParams();
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

  checkParams(): void {
    this.activatedRoute.queryParamMap.subscribe((params: any) => { this.params = params.params; });
    if (this.params.order_service) {
      this._lockers.getProductsByIncome(this.params.order_service)
        .subscribe((res: any) => {
          this.buildForm(res);
        }, err => {
          throw err;
        });
    }
  }

  buildForm(res: any): void {
    this.formUpdateLocker = this._fb.group({
      guide_number: [{ value: res ? res.guide_number_alph : res.guide_number, disabled: true }],
      user: [{ value: res ? res.locker : null, disabled: true }, [Validators.required]],
      conveyor: [{ value: res ? res.conveyor : null, disabled: true }, [Validators.required]],
      receipt_date: [{ value: { year: this.actualDate.getUTCFullYear(), month: this.actualDate.getUTCMonth() + 1, day: this.actualDate.getDate() }, disabled: true }, [Validators.required]],
      order_service: [{ value: res ? res.order_service : null, disabled: true }],
      max_quantity: [res.max_quantity ? res.max_quantity : 0],
      products: this._fb.array([])
    });
    this.pushIfExistProducts(res.products);
  }

  get form() {
    return this.formUpdateLocker.controls;
  }

  pushIfExistProducts(products: any) {
    for (let index = 0; index < products.length; index++) {
      this.firstProductSelected = products[0];
      this.addItem(products[index], true);
    }
  }

  addItem(product?: any, status?: boolean): void { // Método para pushear un nuevo ítem al arreglo de productos.
    this.products = this.formUpdateLocker.get('products') as FormArray; // Igualamos el arreglo de productos al array products del FormArray
    this.products.push(this.createItem(product, status)); // Pusheamos un nuevo ítem al arreglo de productos.
  }

  createItem(item?: any, status?: boolean): FormGroup { // Creamos el ítem del formulario dinámico
    if (!status) {
      item.id = null;
    }
    let createItem = this._fb.group({
      id: [item ? item.id : null],
      product: [item ? item.product : null],
      name: [item ? item.product?.name : null, [Validators.required]],
      declared_value_admin: [item ? item.declared_value_admin : null, [Validators.required]],
      permanent_shipping_value: [item ? item.permanent_shipping_value : null],
      quantity: [item ? item.quantity : 1],
      weight: [item ? item.weight : null, [Validators.required]],
      force_commercial_shipping: [item ? item.force_commercial_shipping : false],
      order_service: [item ? item.order_service : null],
      images: [item ? item.images : []],
      invoice_images: [item ? (item.product?.invoice ? item.product.invoice : []) : []],
      conveyor: [item ? item.conveyor : null],
      guide_number: [item ? item.product?.guide_number : null],
      guide_number_alph: [item ? item.guide_number_alph : null],
      locker_observations: [null],
      client_observations: [null],
      status: [item ? item.status : null],
      free_shipping: [false],
      loadingImage: [false],
      scrap_image: [item ? item.product?.image : null],
      // novelty_article: [null]
    });
    return createItem;
  }

  removeItem(i: number): void { // Removemos un item de ingreso.
    this.products.value.splice(i, 1);
    this.products.controls.splice(i, 1);
  }

  addQuantity(i: number): void { // Añadir una cantidad al producto
    let actualQuantity: number = this.formUpdateLocker.get('products')['controls'][i].controls.quantity.value;
    this.formUpdateLocker.get('products')['controls'][i].controls.quantity.setValue(actualQuantity + 1);
  }

  substractQuantity(i: number): void { // Quitar una cantidad a un producto.
    let actualQuantity: number = this.formUpdateLocker.get('products')['controls'][i].controls.quantity.value;
    if (actualQuantity > 1) {
      this.formUpdateLocker.get('products')['controls'][i].controls.quantity.setValue(actualQuantity - 1);
    }
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
      this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(true);
      const formData = new FormData(); // Creamos un formData para enviarlo
      formData.append('images', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => {
        if (res.images) { // res.images es un arreglo
          this.products.controls[position]['controls'][array].setValue([...this.products.controls[position]['controls'][array].value, res.images[0]]) // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
        }
        this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
      }, err => {
        this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen del producto, intenta de nuevo.', 'error');
        throw err;
      });
    } else { // invoice_images = se irá al endpoint de añadir una nueva imagen de factura.
      this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(true);
      const formDataInvoice = new FormData();  // Pusheamos la respuesta de la imagen comprimida en el formData
      formDataInvoice.append('invoice', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageInvoice(formDataInvoice).subscribe((res: any) => {
        if (res.invoice) { // res.invoice es un arreglo
          this.products.controls[position]['controls'][array].setValue([...this.products.controls[position]['controls'][array].value, res.invoice[0]]) // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
        }
        this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
      }, err => {
        this.formUpdateLocker.get('products')['controls'][position].controls.loadingImage.setValue(false);
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

  clickGuideItem(item: any) {
    if (typeof item === 'object') {
      for (let index = 0; index < this.formUpdateLocker.controls.products.value.length; index++) {
        this.removeItem(index);
      }
      this.formUpdateLocker.controls.user.setValue({ locker_id: item.locker.id, full_name: item.user.name + " " + item.user.last_name });
      let userConveyor = this.conveyors.filter(x => x.id === item.conveyor);
      this.formUpdateLocker.controls.conveyor.setValue(userConveyor[0]);
      let data = {
        product: {
          name: item.product.name,
          permanent_shipping_value: item.product.permanent_shipping_value,
          quantity: item.product.quantity,
          image: item.product.image,
          force_commercial_shipping: (item.product.force_commercial_shipping ? item.product.force_commercial_shipping : false),
          images: item.images
        },
        product_price: item.product_price,
        order_service: item.order_service.id,
        weight: item.weight
      };
      this.selectedProductOrder = data;
      this.addItem(data);
    }
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

  displayLocker(locker: any) { // Método para mostrar la data en elautocomplete del locker o user
    return locker ? `CA${locker.locker_id} | ${locker.user.name} ${locker.user.last_name}` : '';
  }

  displayGuides(guide: any): void {
    return guide ? guide : "";
  }

  displayOrder(order: any) {
    return order ? `${order.order_service.id} | ${order.product.name}` : '';
  }

  validatePushItems(): void {
    let actualQuantity: number = 0;
    for (let index = 0; index < this.formUpdateLocker.get('products')['controls'].length; index++) {
      actualQuantity += this.formUpdateLocker.get('products')['controls'][index].value.quantity;
    }
    if (actualQuantity > this.formUpdateLocker.controls.max_quantity.value) {
      this._notify.show('', `Has superado la cantidad máxima de productos que puedes ingresar (${this.formUpdateLocker.controls.max_quantity.value} máximo) y tu tienes (${actualQuantity} cantidades), revisa la cantidad de tus productos.`, 'info');
      return;
    } else {
      this.addItem(this.firstProductSelected);
    }
  }

  registerData(): void {

    if (this.formUpdateLocker.invalid) {
      this._notify.show('', 'Asegurate que hayas llenado todos los campos, antes de completar el ingreso.', 'info');
      return;
    }

    let actualQuantity: number = 0;

    for (let index = 0; index < this.formUpdateLocker.get('products')['controls'].length; index++) {
      actualQuantity += this.formUpdateLocker.get('products')['controls'][index].value.quantity;
    }
    if (actualQuantity > this.formUpdateLocker.controls.max_quantity.value) {
      this._notify.show('', `Has superado la cantidad máxima de productos que puedes ingresar (${this.formUpdateLocker.controls.max_quantity.value} máximo) y tu tienes (${actualQuantity} cantidades), revisa tus productos.`, 'info');
      return;
    }

    this.isLoading = true;

    let payload = insertOnlyLocker(this.formUpdateLocker.getRawValue(), this.params.order_service, this.params.income);
    this._lockers.updateLocker(payload)
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
