import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { getInsertCreateOrder } from 'src/app/_helpers/tools/create-order-parse.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { OrderService } from '../../../_services/orders.service';
import { isSwitched, numberOnly, isRequired } from '../../../../../_helpers/tools/utils.tool';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})

export class CreateOrderComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Output() close_modale = new EventEmitter<any>();
  @Input() trm;
  @Input() public users: any = [];

  public createProductForm: FormGroup;
  public products: FormArray;
  public isLoading: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private quotationService: OrderService,
    private _notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  //creacion del formulario principal
  buildForm() {
    this.createProductForm = this._formBuilder.group({
      link: [null],
      name: [null],
      description: [null],
      quantity: [1],
      aditional_info: [null],
      image: [null],
      products: this._formBuilder.array([]),
      user: [null],
      price: [0]
    });

  }

  //retorna los controles del formulario que se consumen desde el HTML
  get form() {
    return this.createProductForm.controls;
  }

  // Creación de productos con formularios reactivos y dinamicos multinivel
  createProduct(): FormGroup {
    return this._formBuilder.group({
      link: [this.createProductForm.value.link, []],
      name: [this.createProductForm.value.name, [Validators.required]],
      aditional_info: [this.createProductForm.value.aditional_info],
      description: [this.createProductForm.value.description],
      image: [this.createProductForm.value.image, [Validators.required]],
      quantity: [this.createProductForm.value.quantity, [Validators.required]],
      product_value: [this.createProductForm.value.price ? this.createProductForm.value.price : 0, [Validators.required]],
      tax: [0], //((this.createProductForm.value.price ? this.createProductForm.value.price : 0) * (this.createProductForm.value.quantity ? this.createProductForm.value.quantity : 0)) * 0.07
      weigth: [0, [Validators.required]],
      discount: [0],
      shipping_origin_value_product: [0],
      permanent_shipping_value: [0],
      free_shipping: [false]
    });
  }

  //creamos un producto nuevo que sera pusheado en los formArray
  addProduct(): void {

    if (!this.createProductForm.invalid) {

      this.products = this.createProductForm.get('products') as FormArray;
      this.isLoading = true;

      if (this.form.link.value) {
        this.quotationService.getProductInfo(this.form.link.value.trim())
          .subscribe((res) => {
            console.log(res);
            if (res) {
              this.form.image.setValue(res.image);
              this.form.name.setValue(res.name);
              this.form.description.setValue(res.description || 'No existe descripción');
              this.form.price.setValue(res.price ? res.price : 0);
              this.products.push(this.createProduct());
              this.disableTax();
              this._notify.show('Tu producto ha sido añadido correctamente.', '', 'success');
              this.cleanForm();
            } else {
              this._notify.show('Algo ha sucedido y no hemos encontrado la información de tu producto.', '', 'warning');
            }
            this.isLoading = false;

          }, err => {
            console.log(err);
            this._notify.show('Algo ha sucedido y no hemos encontrado la información de tu producto.', '', 'warning');
            this.isLoading = false;
            throw err;
          });
      } else {
        this._notify.show('No has añadido ningún producto.', '', 'warning');
        this.isLoading = false;
      }

    } else {
      this.isLoading = false;
      this._notify.show('Los datos del producto están incompletos.', '', 'warning');
    }

  }

  disableTax(): void {
    for (let index = 0; index < this.products.controls.length; index++) {
      this.products.controls[index].get("tax").disable();
    }
  }

  cleanForm(): void { //RESET CREATE PRODUCT FORM

    for (const field in this.createProductForm.controls) {
      if (this.isRequired(field)) {
        this.createProductForm.controls[field].reset();
        this.createProductForm.controls[field].setValidators([Validators.required]);
      }

    }

    this.createProductForm.controls.quantity.setValue(1);
  }

  isAllowed(item: string) { // Método para saber que campos se pueden activar/desactivar
    return isSwitched(item);
  }

  isRequired(item: string) {
    return isRequired(item);
  }

  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

  resetProductValue(position: number) {

    let freeShipping = this.products.controls[position]["controls"].free_shipping.value; // Traemos el valor del free_shipping
    this.products = this.createProductForm.get('products') as FormArray; // Convertimos los productos en un FormArray

    for (const field in this.products.controls[position]["controls"]) { // Recorremos todos los controls del formulario para obtener su nombre

      if (freeShipping) { // Si el envío es gratis 

        if (this.isAllowed(field)) { // Llamamos al método para saber cuales campos del formulario se permiten deshabilitar
          this.products.controls[position].get(field).disable(); // Deshabilitamos el control
          this.products.controls[position].get(field).setValue(0); // Volvemos su valor 0
        }

      } else {

        if (this.isAllowed(field)) { // Si es falso simplemente volvemos la propiedad enable() (activo)
          this.products.controls[position].get(field).enable(); // Habilitamos el controlador si freeShipping es verdadero
        }

      }

    }

  }

  getFormula() {
    console.log("INPUTT CLOSE", this.products.value);
    this.quotationService.calculateShipping(this.products.value).subscribe((res) => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

  // Consumimos el endPoint de creación de orden por parte del administrador 
  createOrder() {

    if (!this.createProductForm.value.user) { // Si no hay un usuario asignado a través del selector no se deja pasar.
      this._notify.show("Atención", "Selecciona un usuario al cual asignar el producto.", "info");
      return;
    }

    if (this.createProductForm.value.products) { // Si no hay productos asignados no se deja pasar
      if (this.createProductForm.value.products.length === 0) {
        this._notify.show("Atención", "No hay productos asignados.", "info");
        return;
      }
    }

    if (this.createProductForm.valid) {

      this.isLoading = true;

      this.quotationService.createQuotation({
        ...getInsertCreateOrder(
          this.createProductForm.getRawValue().user,
          this.createProductForm.getRawValue().products
        )
      }).subscribe(res => {
        // console.log('creamos la orden desde el administrador', res);
        this._notify.show('Transacción Exitosa', res.message, 'success');
        this.isLoading = false;
        this.close_modale.emit();
        this.refreshTable.emit(true);
      }, err => {
        this._notify.show('Error', err, 'error');
        this.isLoading = false;
        throw err;
      });

    } else {
      this._notify.show('Datos incompletos', `- Selecciona el usuario \b -Seleccióna al menos un producto`, 'info');
    }
  }

}
