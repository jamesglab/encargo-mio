import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileHandle } from 'src/app/_directives/file-handle';
import { insertOnlyLocker, tranformFormItemNotIncome } from 'src/app/_helpers/tools/create-order-parse.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
import { NotifyService } from 'src/app/_services/notify.service';
import { LockersService } from '../../../_services/lockers.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageViewComponent } from '../image-view/image-view.component';
import { TakePhotoComponent } from 'src/app/shared/ui/take-photo/take-photo.component';

@Component({
  selector: 'app-not-income-products',
  templateUrl: './not-income-products.component.html',
  styleUrls: ['./not-income-products.component.scss']
})

export class NotIncomeProductsComponent implements OnInit {

  @Input() public order_has_products: any = [];
  @Input() public formInsertLocker: any;

  @Input() public getDataIncome: boolean;

  @Output() public refreshData: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public productsStatus: EventEmitter<any> = new EventEmitter<any>();
  @Output() public refreshShippingLocker: EventEmitter<boolean> = new EventEmitter<boolean>();

  public formNotIncome: FormGroup;
  public products: FormArray;

  public isLoading: boolean = false;

  public params: any = {};

  constructor(
    public _fb: FormBuilder,
    public _notify: NotifyService,
    public _compress: ImageCompressService,
    private _lockers: LockersService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params: any) => { this.params = params.params; });
  }

  ngOnChanges() {
    if (this.getDataIncome) {
      this.productsStatus.emit(this.formNotIncome.getRawValue());
    }
    this.buildForm();
  }

  buildForm() {

    let promises: any = [];

    this.formNotIncome = this._fb.group({
      product: this._fb.array([])
    });

    for (let index = 0; index < this.order_has_products.length; index++) {
      promises.push(this.pushItems(this.order_has_products[index]));
    }

    Promise.all([promises]).then(() => { // Cuando finalice el recorrido del for va entrar a este m??todo 
      if (this.params.secuential_fraction) {
        window.open(`${location.origin}/lockers/insert-in-locker?order_service=${this.params.order_service}&product=${this.params.product}&secuential_fraction=${this.params.secuential_fraction}#:~:text=PEC ${this.params.product}???${this.params.secuential_fraction}`, "_self");
      } else if (this.params.order_service) {
        if (this.params.product) {
          window.open(`${location.origin}/lockers/insert-in-locker?order_service=${this.params.order_service}&product=${this.params.product}#:~:text=PEC ${this.params.product}`, "_self");
        }
      }
    });

  }

  pushItems(product?: any) {
    this.products = this.formNotIncome.get('product') as FormArray;
    this.products.push(this.createItem(product));
  }

  createItem(product?: any): FormGroup {
    let item = this._fb.group({
      id: [null],
      product: [product ? (product.product?.id ? { id: product ? product.product?.id : null } : null) : null],
      product_link: [product ? product?.product?.link : null],
      name: [product ? product.product?.name : null, [Validators.required]],
      declared_value_admin: [product ? product.product_price : null, [Validators.required]],
      weight: [product ? product.weight : null, [Validators.required, Validators.minLength(0.1)]],
      permanent_shipping_value: [product ? product.product?.permanent_shipping_value : null],
      quantity: [product?.product?.pending_quantity ? product.product?.pending_quantity : 1],
      order_service: [product ? product?.order_service : null],
      images: [[]],
      images_locker: [product?.product?.images ? product?.product?.images : []],
      invoice_images: [product?.invoice_images ? product.invoice_images : []],
      description: [product ? product.product?.description : null],
      aditional_info: [{ value: product ? product.product?.aditional_info : null, disabled: true }],
      force_commercial_shipping: [product ? product.force_commercial_shipping : false],
      free_shipping: [product ? product.free_shipping : false],
      incomed_quantity: [product ? product.product?.incomed_quantity : null],
      pending_quantity: [product ? product.product?.pending_quantity : null],
      secuential_fraction: [null],
      shipping_to_locker: [product ? product.shipping_to_locker : null]
    });
    if (product?.product?.image) {
      let value = item.controls.images_locker.value;
      value.push({ Location: product.product.image });
    }
    return item;
  }

  removeItem(i: number): void { // Removemos un item de ingreso.
    if (this.products.value[i].id) {
      Swal.fire({
        title: '??Est??s seguro que quieres cambiar el estado?',
        text: 'Si das clic en aceptar el ingreso cambiar?? al estado sin ingreso.',
        confirmButtonText: 'S??',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        cancelButtonColor: '#d33'
      }).then((result: any) => {
        if (result.isConfirmed) {
          this._lockers.deleteIncome(this.products.value[i].id).subscribe(() => {
            this.refreshData.emit(true);
          }, err => {
            Swal.fire('', 'Ocurri?? al intentar cambiar el estado del ingreso.', 'error');
            throw err;
          });
        }
      });
    } else {
      this.products.value.splice(i, 1);
      this.products.controls.splice(i, 1);
    }
  }

  changeEditStatus(position: number): void {
    let status = this.products.controls[position]['controls'].editable.value;
    status = !status;
    this.products.controls[position]['controls'].editable.setValue(status);
    for (const i in this.products.controls[position]['controls']) {
      if (this.products.controls[position]['controls'].editable.value) {
        this.products.controls[position]['controls'][i].enable();
      } else {
        this.products.controls[position]['controls'][i].disable();
      }
    }
  }

  filesDropped(file: FileHandle[], position: number, array: string) { // M??todo el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {  // file = file del drop, i = posici??n de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
      this._compress.compressImage(file[0].base64).then((res: any) => {
        this.uploadImageToBucket(res, position, array);
      }, err => {
        this._notify.show('', 'Ocurri?? un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImageLocally(position: number, array: string) {  // position = item din??mico del ingreso del arreglo, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this._compress.uploadImage().then((res: any) => {
      this.uploadImageToBucket(res, position, array);
    }, err => {
      this._notify.show('', 'Ocurri?? un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  uploadImageToBucket(response: any, position: number, array: string): void {
    if (array === 'images_locker') { // Images = se ir?? al endpoint de a??adir una nueva imagen del producto
      const formData = new FormData(); // Creamos un formData para enviarlo
      formData.append('images', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => {
        if (res.images) { // res.images es un arreglo
          for (let index = 0; index < res.images.length; index++) {
            let arrayImages: any[] = this.products.controls[position]['controls'][array].value;
            arrayImages.push(res.images[index]);
            this.products.controls[position]['controls'][array].setValue(arrayImages); // Pusheamos la respuesta del backend en su respetiva posici??n y arreglo.
          }
        }
      }, err => {
        this._notify.show('', 'Ocurri?? un error al intentar cargar la imagen del producto, intenta de nuevo.', 'error');
        throw err;
      });
    } else { // invoice_images = se ir?? al endpoint de a??adir una nueva imagen de factura.
      const formDataInvoice = new FormData();  // Pusheamos la respuesta de la imagen comprimida en el formData
      formDataInvoice.append('invoice', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageInvoice(formDataInvoice).subscribe((res: any) => {
        if (res.invoice) { // res.invoice es un arreglo
          for (let index = 0; index < res.invoice.length; index++) { // recorremos el arreglo 
            let arrayImages: any[] = this.products.controls[position]['controls'][array].value;
            arrayImages.push(res.invoice[index]);
            this.products.controls[position]['controls'][array].setValue(arrayImages); // Pusheamos la respuesta del backend en su respetiva posici??n y arreglo.
          }
        }
      }, err => {
        this._notify.show('', 'Ocurri?? un error al intentar cargar la imagen de la factura, intenta de nuevo.', 'error');
        throw err;
      });
    }
  }

  onRemoveImage(position: number, i: number, array: string) { // position = item din??mico del ingreso, i = posici??n de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this.isLoading = true;
    this._lockers.deleteImage(this.products.controls[position]['controls'][array].value[i].Key)
      .subscribe(() => {
        this.products.controls[position]['controls'][array].value.splice(i, 1);
        this.isLoading = false;
      }, err => {
        this._notify.show('', 'Ocurri?? un error al intentar eliminar la imagen, intenta de nuevo.', 'error');
        this.isLoading = false;
        throw err;
      });
  }

  uploadWebCamImage(file: any, array: any) {
    this._compress.compressImage(file.base64).then((res: any) => {
      this.uploadImageToBucket(res, file.position, array);
    }, err => {
      this._notify.show('', 'Ocurri?? un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  addQuantity(i: number): void { // A??adir una cantidad al producto
    let actualQuantity: number = this.formNotIncome.get('product')['controls'][i].controls.quantity.value;
    if (!this.formNotIncome.get('product')['controls'][i].controls.pending_quantity.value) {
      this.formNotIncome.get('product')['controls'][i].controls.quantity.setValue(actualQuantity + 1);
      return;
    }
    if (actualQuantity < this.formNotIncome.get('product')['controls'][i].controls.pending_quantity.value) {
      this.formNotIncome.get('product')['controls'][i].controls.quantity.setValue(actualQuantity + 1);
      return;
    }
  }

  substractQuantity(i: number): void { // Quitar una cantidad a un producto.
    let actualQuantity: number = this.formNotIncome.get('product')['controls'][i].controls.quantity.value;
    if (actualQuantity > 1) {
      this.formNotIncome.get('product')['controls'][i].controls.quantity.setValue(actualQuantity - 1);
    }
  }

  numberOnly(number: any) {
    if (!number.key.match(/^\d*\.?\d*$/)) {
      number.preventDefault();
    }
  }

  onImageError(event: any) { // Cuando hay un error en alguna imagen se setea una imagen de una caja por defecto.
    event.target.src = "https://i.imgur.com/riKFnErh.jpg";
  }

  addIncome(position: number) {

    if (this.formNotIncome.getRawValue().product[position].pending_quantity > 0) {

      if (this.formNotIncome.getRawValue().product[position].quantity === this.formNotIncome.getRawValue().product[position].pending_quantity) {
        this._notify.show('', `No puedes a??adir m??s ingresos al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id}, debido a que tiene todas las cantidades (${this.formNotIncome.getRawValue().product[position].quantity}) ya han sido a??adidas.`, 'info');
        return;
      }

      if (this.formNotIncome.getRawValue().product[position].quantity > this.formNotIncome.getRawValue().product[position].pending_quantity) {
        this._notify.show('', `Has superado la cantidad m??xima de ingresos que puedes hacer (${this.formNotIncome.getRawValue().product[position].pending_quantity} m??ximo) al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id} y tu tienes (${this.formNotIncome.getRawValue().product[position].quantity} cantidades), revisa la cantidad de tus productos.`, 'info');
        return;
      }

      let check = this.checkProductQuantity();

      if (check.length === 0) {
        let product: any = tranformFormItemNotIncome(this.products.controls[position]['controls']);
        this.products.controls.splice(position + 1, 0, this.createItem(product));
      } else {

        let totalQuantity: number = 0;

        for (let index = 0; index < check.length; index++) {
          totalQuantity += check[index].quantity;
        }

        if (totalQuantity === this.formNotIncome.getRawValue().product[position].pending_quantity) {
          this._notify.show('', `No puedes a??adir m??s ingresos al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id}, debido a que tiene todas las cantidades (${totalQuantity}) ya han sido a??adidas.`, 'info');
          return;
        }

        if (totalQuantity > this.formNotIncome.getRawValue().product[position].pending_quantity) {
          this._notify.show('', `Has superado la cantidad m??xima de ingresos que puedes hacer (${this.formNotIncome.getRawValue().product[position].pending_quantity} m??ximo) al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id} y tu tienes (${totalQuantity} cantidades), revisa la cantidad de tus productos.`, 'info');
          return;
        }

        if (totalQuantity < this.formNotIncome.getRawValue().product[position].pending_quantity) {
          let product: any = tranformFormItemNotIncome(this.products.controls[position]['controls']);
          this.products.controls.splice(position + 1, 0, this.createItem(product));
        }

      }

    } else {
      this.products.push(this.createItem());
    }

  }

  checkIfProductsRepeat() {
    const searchItems = this.formNotIncome.getRawValue().product.reduce((a: any, e: any) => {
      a[e.product.id] = ++a[e.product.id] || 0;
      return a;
    }, {});
    let findItems = this.formNotIncome.getRawValue().product.filter(e => searchItems[e.product.id]);
    return findItems;
  }

  checkProductQuantity() {
    let products = this.checkIfProductsRepeat();
    return products;
  }

  openModalImage(image: string, url: string) {
    let modal = this.modalService.open(ImageViewComponent, { size: 'lg', centered: true });
    modal.componentInstance.image = image;
    modal.componentInstance.url = url;
  }

  openWebCam(position: number, array: string): void {
    const modal = this.modalService.open(TakePhotoComponent, {
      size: "lg",
      centered: true
    });
    modal.componentInstance.position = position;
    modal.result.then((res) => {
      if (res) {
        this.uploadWebCamImage(res, array);
      }
    });
  }

  registerData(position?: number): void {

    this.refreshShippingLocker.emit(this.formNotIncome.controls.product['controls'][position].controls.shipping_to_locker.value);

    if (this.formInsertLocker.invalid) {
      this._notify.show('', `No has completado el formulario correctamente, revisalo y vuelve a intentarlo.`, 'info');
      return;
    }

    if (this.formNotIncome.controls.product['controls'][position].invalid) {
      this._notify.show('', `No has completado el formulario del Ingreso ${position + 1} correctamente, revisalo y vuelve a intentarlo.`, 'info');
      return;
    }

    if (!this.formNotIncome.getRawValue().product[position].product) {

      for (let index = 0; index < this.formNotIncome.getRawValue().product.length; index++) {
        let payload: any = null;
        payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), null, [this.formNotIncome.getRawValue().product[index]]);

        this.isLoading = true;
        this._lockers.insertIncome(payload).subscribe(() => {
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
                this.refreshData.emit(true);
                this.isLoading = false;
              }
            }
          });
        }, err => {
          this.isLoading = false;
          this._notify.show('', 'Ocurri?? un error al intentar hacer el ingreso a casillero, intenta de nuevo.', 'error');
          throw err;
        });
      }

    } else {

      let payload: any = null;
      let checkArray = this.checkIfProductsRepeat();
      if (checkArray && checkArray.length === 0) {
        if (this.formNotIncome.getRawValue().product[position].quantity.value > this.formNotIncome.getRawValue().product[position].pending_quantity.value) {
          this._notify.show('', `Has superado la cantidad m??xima de ingresos que puedes hacer (${this.formNotIncome.getRawValue().product[position].pending_quantity} m??ximo) al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id} y tu tienes (${this.formNotIncome.getRawValue().product[position].product.quantity} cantidades), revisa la cantidad de tus productos.`, 'info');
        }
        payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), this.formNotIncome.getRawValue().product[position].order_service, [this.formNotIncome.getRawValue().product[position]]);
      } else {
        let totalQuantity: number = 0;
        for (let index = 0; index < checkArray.length; index++) {
          totalQuantity += checkArray[index].quantity;
        }
        if (totalQuantity > this.formNotIncome.getRawValue().product[position].pending_quantity) {
          this._notify.show('', `Has superado la cantidad m??xima de ingresos que puedes hacer (${this.formNotIncome.getRawValue().product[position].pending_quantity} m??ximo) al producto con PEC ${this.formNotIncome.getRawValue().product[position].product.id} y tu tienes (${totalQuantity} cantidades), revisa la cantidad de tus productos.`, 'info');
          return;
        }
        payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), this.formNotIncome.getRawValue().product[position].order_service, checkArray);
      }

      this.isLoading = true;
      this._lockers.insertIncome(payload).subscribe(() => {
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
              this.refreshData.emit(true);
              this.isLoading = false;
            }
          }
        });
      }, err => {
        this.isLoading = false;
        this._notify.show('', 'Ocurri?? un error al intentar hacer el ingreso a casillero, intenta de nuevo.', 'error');
        throw err;
      });

    }

  }

}
