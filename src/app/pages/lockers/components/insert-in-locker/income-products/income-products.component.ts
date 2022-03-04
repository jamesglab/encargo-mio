import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileHandle } from 'src/app/_directives/file-handle';
import { insertOnlyLocker, tranformFormItemNotIncome } from 'src/app/_helpers/tools/create-order-parse.tool';
import { ImageCompressService } from 'src/app/_services/image-compress.service';
import { NotifyService } from 'src/app/_services/notify.service';
import { LockersService } from '../../../_services/lockers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-income-products',
  templateUrl: './income-products.component.html',
  styleUrls: ['./income-products.component.scss']
})

export class IncomeProductsComponent implements OnInit {

  @Input() public locker_has_product: any = [];
  @Input() public formInsertLocker: any;
  @Input() public order_service: string;

  public formLockerHasProduct: FormGroup;
  public products: FormArray;

  public isLoading: boolean = false;

  constructor(
    public _fb: FormBuilder,
    public _notify: NotifyService,
    public _compress: ImageCompressService,
    private _lockers: LockersService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log(this.locker_has_product);
    if (this.locker_has_product && this.locker_has_product.length > 0) {
      this.buildForm();
    }
  }

  buildForm() {
    this.formLockerHasProduct = this._fb.group({
      product: this._fb.array([])
    });
    for (let index = 0; index < this.locker_has_product.length; index++) {
      this.pushItems(this.locker_has_product[index])
    }
  }

  pushItems(product?: any) {
    this.products = this.formLockerHasProduct.get('product') as FormArray;
    this.products.push(this.createItem(product));
  }

  createItem(product?: any): FormGroup {
    console.log(product);
    let item = this._fb.group({
      id: [product ? product.id : null],
      product: [product ? (product.product?.id ? { id: product ? product.product?.id : null } : null) : null],
      name: [{ value: product ? product.product?.name : null, disabled: true }, [Validators.required]],
      declared_value_admin: [{ value: product ? product.declared_value_admin : 0, disabled: true }, [Validators.required]],
      weight: [{ value: product ? product.weight : null, disabled: true }, [Validators.required]],
      permanent_shipping_value: [{ value: product ? product.permanent_shipping_value : 0, disabled: true }],
      quantity: [product.quantity ? product.quantity : 1],
      order_service: [product ? product.order_service : null],
      images: [product.images ? product.images : []],
      invoice_images: [product.invoice_images ? product.invoice_images : []],
      description: [{ value: product ? product.product.description : null, disabled: true }],
      aditional_info: [{ value: product ? product.product.aditional_info : null, disabled: true }],
      force_commercial_shipping: [{ value: product ? product.force_commercial_shipping : false, disabled: true }],
      free_shipping: [{ value: product ? product.free_shipping : false, disabled: true }],
      secuential_fraction: [product ? product.secuential_fraction : null],
      editable: [false],
      scrap_image: [product ? product.product?.image : null],
      pending_quantity: [product ? product.product.pending_quantity : null]
    });
    return item;
  }

  removeItem(i: number): void { // Removemos un item de ingreso.
    this.products.value.splice(i, 1);
    this.products.controls.splice(i, 1);
  }

  editData(position: number) {
    this.changeEditStatus(position);
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

  filesDropped(file: FileHandle[], position: number, array: string) { // Método el cual entra cuando un usuario hace el "drop"
    if (!this.formLockerHasProduct.get('product')['controls'][position].controls.editable.value) {
      return;
    }
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
    if (!this.formLockerHasProduct.get('product')['controls'][position].controls.editable.value) {
      return;
    }
    this._compress.uploadImage().then((res: any) => {
      this.uploadImageToBucket(res, position, array);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  uploadImageToBucket(response: any, position: number, array: string): void {
    if (array === 'images') { // Images = se irá al endpoint de añadir una nueva imagen del producto
      const formData = new FormData(); // Creamos un formData para enviarlo
      formData.append('images', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => {
        if (res.images) { // res.images es un arreglo
          for (let index = 0; index < res.images.length; index++) {
            this.products.controls[position]['controls'][array].value.push(res.images[index]); // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
          }
        }
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen del producto, intenta de nuevo.', 'error');
        throw err;
      });
    } else { // invoice_images = se irá al endpoint de añadir una nueva imagen de factura.
      const formDataInvoice = new FormData();  // Pusheamos la respuesta de la imagen comprimida en el formData
      formDataInvoice.append('invoice', response.file); // Pusheamos la respuesta de la imagen comprimida en el formData
      this._lockers.uploadImageInvoice(formDataInvoice).subscribe((res: any) => {
        if (res.invoice) { // res.invoice es un arreglo
          for (let index = 0; index < res.invoice.length; index++) { // recorremos el arreglo 
            this.products.controls[position]['controls'][array].value.push(res.invoice[index]); // Pusheamos la respuesta del backend en su respetiva posición y arreglo.
          }
        }
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen de la factura, intenta de nuevo.', 'error');
        throw err;
      });
    }
  }

  onRemoveImage(position: number, i: number, array: string) { // position = item dinámico del ingreso, i = posición de la imagen, array = tipo de arreglo de imagen: "image" o "invoice_image"
    this.isLoading = true;
    this._lockers.deleteImage(this.products.controls[position]['controls'][array].value[i].Key)
      .subscribe(() => {
        this.products.controls[position]['controls'][array].value.splice(i, 1);
        this.isLoading = false;
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar eliminar la imagen, intenta de nuevo.', 'error');
        this.isLoading = false;
        throw err;
      });
  }

  addQuantity(i: number): void { // Añadir una cantidad al producto
    console.log("1", this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.value);
    console.log("2", this.formLockerHasProduct.get('product')['controls'][i].controls.pending_quantity.value);
    if (this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.value <= this.formLockerHasProduct.get('product')['controls'][i].controls.pending_quantity.value) {
      let actualQuantity: number = this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.value;
      this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.setValue(actualQuantity + 1);
    }
  }

  substractQuantity(i: number): void { // Quitar una cantidad a un producto.
    let actualQuantity: number = this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.value;
    if (actualQuantity > 1) {
      this.formLockerHasProduct.get('product')['controls'][i].controls.quantity.setValue(actualQuantity - 1);
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

  saveItem(position: number) {
    this.changeEditStatus(position);
    let payload = insertOnlyLocker(this.formInsertLocker.getRawValue(), this.order_service, [this.formLockerHasProduct.getRawValue().product[position]]);
    console.log(payload);
    this.isLoading = true;
    this._lockers.insertIncome(payload).subscribe((res: any) => {
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
