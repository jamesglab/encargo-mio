import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  public conveyors: any = [];
  public users: any = [];

  public cloudImages: any = [];
  public cloudInvoiceImages: any = [];

  public filteredConveyors: Observable<string[]>;
  public filteredUsers: Observable<string[]>;

  constructor(
    public _fb: FormBuilder,
    private _notify: NotifyService,
    private _compress: ImageCompressService,
    private _orderService: OrderService,
    private _usersService: UserService,
    private _lockers: LockersService,
    public _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getAllData();
    this.checkOperativeSystem();
  }

  buildForm(): void { // Creamos el formulario general.
    this.formInsertLocker = this._fb.group({
      guide_number: [null, [Validators.required]],
      user: [null, [Validators.required]],
      conveyor: [null, [Validators.required]],
      receipt_date: [null, [Validators.required]],
      products: this._fb.array([])
    });
    this.formInsertLocker.controls.user.disable();
    this.formInsertLocker.controls.conveyor.disable();
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

  checkOperativeSystem() { // Checkeamos en que sistema operativo Safari IOS o Chorme.
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        this.isAndroid = true; // Chrome
      } else {
        this.isAndroid = false; // Safari
      }
    }
  }

  createItem(): FormGroup { // Creamos el ítem del formulario dinámico
    let createItem = this._fb.group({
      name: [null, [Validators.required]],
      locker_observations: [null],
      client_observations: [null],
      declared_value_admin: [null, [Validators.required]],
      permanent_shipping_value: [null],
      quantity: [1],
      weight: [null, [Validators.required]],
      novelty_article: [null],
      free_shipping: [false],
      force_commercial_shipping: [false],
      images: [[]],
      invoice_images: [[]]
    });
    return createItem;
  }

  addItem(): void { // Método para pushear un nuevo ítem al arreglo de productos.
    this.products = this.formInsertLocker.get('products') as FormArray; // Igualamos el arreglo de productos al array products del FormArray
    this.products.push(this.createItem()); // Pusheamos un nuevo ítem al arreglo de productos.
  }

  removeItem(i: number): void { // Removemos un item de ingreso.
    this.products.value.splice(i, 1);
    this.products.controls.splice(i, 1);
  }

  filesDropped(file: FileHandle[], position: number, array: string) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {  // file = file del drop, i = posición de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
      this._compress.compressImage(file[0].base64).then((res: any) => {
        this.products.controls[position]['controls'][array].value.push(res);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImage(position: number, array: string) {  // position = item dinámico del ingreso del arreglo, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this._compress.uploadImage().then((res: any) => {
      this.products.controls[position]['controls'][array].value.push(res);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  onRemoveImage(position: number, i: number, array: string) { // position = item dinámico del ingreso, i = posición de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this.products.controls[position]['controls'][array].value.splice(i, 1);
  }

  onImageError(event: any) { // Cuando hay un error en alguna imagen se setea una imagen de una caja por defecto.
    event.target.src = "https://i.imgur.com/riKFnErh.jpg";
  }

  numberOnly($event): boolean { // Función para que sólo se permitan números en un input
    return numberOnly($event, this.isAndroid);
  }

  _filter(value: string, array: any): string[] { // Método que usa el filtro del material autocomplete
    const filterValue = this._normalizeValue(value, array);
    let fileterdData = this[array].filter(option => this._normalizeValue(option, array).includes(filterValue)); // Simplemente filtramos los valores incluyendo lo que el usuario escribe (filterValue)
    if (fileterdData.length > 0) { // Si filteredData retorna más de 1 valor entonces retornamos la data al autocomplete
      return fileterdData;
    } else {
      return this[array]; // Si no retorna nada el filteredData simplemente retornamos el arreglo completo (dinámico).
    }
  }

  _normalizeValue(value: any, array: any): string { // Método para normalizar el valor del autocomplete convirtiéndolo en minúscula.
    if (typeof value === 'object') {
      if (array === 'conveyors') {
        return value.name.toLowerCase().replace(/\s/g, '');
      } else if (array === 'users') {
        return value.full_name.toLowerCase().replace(/\s/g, '');
      }
    } else {
      return value.toLowerCase().replace(/\s/g, '');
    }
  }

  displayFn(option: any) { // Método para mostrar la data en elautocomplete de la transportadora.
    return option ? option.name : '';
  }

  displayLocker(locker: any) { // Método para mostrar la data en elautocomplete del locker o user.
    return locker ? `CA${locker.locker_id} | ${locker.name} ${locker.last_name}` : '';
  }

  validatePushItems(type: string): void { // Método para validar si el formulario es válido y añadir un nuevo ítem
    if (this.formInsertLocker.valid) {
      this.addItem(); // Llamar el método para añadir un nuevo item
      return;
    } else {
      this._notify.show('', 'Asegurate que hayas llenado todos los campos, antes de añadir un ingreso.', 'info');
    }
  }

  registerData(): void { // En este métodoentramos cuando ya el usuario hace clic para completar el ingreso.

    if (this.formInsertLocker.invalid) {
      this._notify.show('', 'Asegurate que hayas llenado todos los campos, antes de completar el ingreso..', 'info');
      return;
    }

    const formData = new FormData();
    const formDataInvoice = new FormData();

    let sendImages: any = [];
    let sendInvoiceImages: any = [];

    for (let product_index = 0; product_index < this.formInsertLocker.value.products.length; product_index++) { // Recorremos el formulario en el arreglo de productos

      for (let image_index = 0; image_index < this.formInsertLocker.value.products[product_index].images.length; image_index++) { // Al obtener el index de cada uno de los ítems de formInsertLocker.value.products en la posición de imagenes
        delete this.formInsertLocker.value.products[product_index].images.url; // Removemos el base64
        formData.append('payload', JSON.stringify({ position: product_index })); // Pusheamos en el payload la posición del arreglo para enviarlo al backend
        sendImages.push(this.formInsertLocker.value.products[product_index].images[image_index].file); // Pusheamos la data solamente del file
      }

      for (let image_index = 0; image_index < this.formInsertLocker.value.products[product_index].invoice_images.length; image_index++) { // Al obtener el index de cada uno de los ítems de formInsertLocker.value.products en la posición de invoice_images
        delete this.formInsertLocker.value.products[product_index].invoice_images.url; // Removemos el base64
        formDataInvoice.append('payload', JSON.stringify({ position: product_index })); // Pusheamos en el payload la posición del arreglo para enviarlo al backend
        sendInvoiceImages.push(this.formInsertLocker.value.products[product_index].invoice_images[image_index].file); // Pusheamos la data solamente del file
      }

    }

    sendImages.forEach((item: any) => { formData.append('images', item); }); // Recorremos el array de sendImages y pusheamos cada ítem en formData
    sendInvoiceImages.forEach((item: any) => { formDataInvoice.append('invoice', item); }); // Recorremos el array de SendInvoiceImages y pusheamos cada ítem en formDataInvoice

    let uploadImagesLocker = new Promise((resolve, reject) => {

      if (sendImages && sendImages.length > 0) {
        this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => { // res.images es la respuesta.

          for (let index = 0; index < res.images.length; index++) { // Recorremos la repuesta que nos da el backendpara obtener el index
            for (let index_product = 0; index_product < this.products.value.length; index_product++) { // Recorremos cada ítem de los productos para obtener su index
              if (res.images[index].position === index_product) { //Comparamos si la respuesta del ítem position es igual al index que teníamos del producto
                this.formInsertLocker.get('products')['controls'][index_product].controls.images.setValue([]); // Seteamos el product.image como un array vacío
                this.formInsertLocker.get('products')['controls'][index_product].controls.images.value.push(res.images[index]); // Pusheamos la data encontrada en product.images
              }
            }
          }

          resolve(res);

        }, err => {
          this._notify.show('', 'Ocurrió un error al intentar guardar la imagen, intenta de nuevo.', 'error');
          reject(err);
          throw err;
        });
      } else {
        resolve("not_images");
      }
    });

    let uploadImagesInvoice = new Promise((resolve, reject) => {

      if (sendInvoiceImages && sendInvoiceImages.length > 0) {
        this._lockers.uploadImageInvoice(formDataInvoice).subscribe((res: any) => { // res.invoice es la respuesta

          for (let index = 0; index < res.invoice.length; index++) { // Recorremos la repuesta que nos da el backendpara obtener el index
            for (let index_product = 0; index_product < this.products.value.length; index_product++) { // Recorremos cada ítem de los productos para obtener su index
              if (res.invoice[index].position === index_product) { // Comparamos si la respuesta del ítem position es igual al index que teníamos del producto
                this.formInsertLocker.get('products')['controls'][index_product].controls.invoice_images.setValue([]);; // Seteamos el product.invoice_images como un array vacío
                this.formInsertLocker.get('products')['controls'][index_product].controls.invoice_images.value.push(res.invoice[index]); // Pusheamos la data encontrada en product.invoice_images
              }
            }
          }
          resolve(res);
        }, err => {
          reject(err);
          throw err;
        });
      } else {
        resolve("not_invoice_images");
      }
    });

    Promise.all([uploadImagesLocker, uploadImagesInvoice]).then((response: any) => {

      for (let index = 0; index < response.length; index++) {
        if (response[index] === 'not_images') {
          this._notify.show('', 'Debes añadir al menos una imagen para los productos.', 'info');
          return;
        }
      }

      this.isLoading = true;

      let payload = insertOnlyLocker(this.formInsertLocker.getRawValue());

      this._lockers.insertInLocker(payload)
        .subscribe((res: any) => {
          console.log("RESPONSE:", res);
          this.isLoading = false;
        }, err => {
          this.isLoading = false;
          throw err;
        });

    });

  }

}