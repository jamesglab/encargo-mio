import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @Output() public close_modale = new EventEmitter<any>();
  @Input() public trm;
  @Input() public users: any = [];

  public typeTax: number = 0.07;
  public selectedTax: string = "1";
  public createProductForm: FormGroup;
  public products: FormArray;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public calculateTotal: any = {};

  constructor(
    private _formBuilder: FormBuilder,
    private quotationService: OrderService,
    private _notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  // Creación del formulario principal
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

  // Retorna los controles del formulario que se consumen desde el HTML
  get form() {
    return this.createProductForm.controls;
  }

  // Creación de productos con formularios reactivos y dinamicos multinivel
  createProduct(): FormGroup {

    let createProduct = this._formBuilder.group({
      link: [this.createProductForm.value.link, []],
      name: [this.createProductForm.value.name, [Validators.required]],
      aditional_info: [this.createProductForm.value.aditional_info],
      description: [this.createProductForm.value.description],
      image: [this.createProductForm.value.image, [Validators.required]],
      quantity: [this.createProductForm.value.quantity, [Validators.required]],
      product_value: [this.createProductForm.value.price ? this.createProductForm.value.price : 0, [Validators.required]],
      tax: [0],
      weigth: [0],
      discount: [0],
      shipping_origin_value_product: [0],
      permanent_shipping_value: [0],
      shipping_value: [0],
      free_shipping: [false],
      sub_total: [0],
      trm: [this.trm ? this.trm : null]
    });

    createProduct.controls.product_value.valueChanges.subscribe((value: number) => { // NOS SUSCRIBIMOS AL CAMBIO DEL VALOR DEL PRODUCTO
      this.calculateTax(createProduct, value ? value : createProduct.controls.product_value.value); // Llamamos al método de calculateTax
      this.calculateTotalPrices(createProduct, value ? value : createProduct.controls.product_value.value); // Llamamos el método de calculateTotalPrices
    });

    createProduct.controls.discount.valueChanges.subscribe((value: number) => { // NOS SUSCRIBIMOS AL CAMBIO DEL VALOR DEL PRODUCTO
      let discount: number;
      discount = (createProduct.controls.sub_total.value * value) / 100;
      createProduct.controls.discount.setValue(discount);
      createProduct.controls.sub_total.setValue(discount);
      console.log(discount);
    });

    return createProduct;

  }

  calculateTax(createProduct: any, product_value?: number) {
    if (this.selectedTax == '1') { // Si selecciona el 1 ícono
      let tax: any = (product_value ? product_value : createProduct.controls.product_value.value * createProduct.controls.quantity.value) * this.typeTax;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      createProduct.controls.tax.setValue(tax);
    } else {  // Si selecciona el 2 ícono
      let tax = ((product_value ? product_value : createProduct.controls.product_value.value * createProduct.controls.quantity.value) + createProduct.controls.shipping_origin_value_product.value) * this.typeTax;
      tax.toString();
      tax = parseFloat(tax.toFixed(2));
      createProduct.controls.tax.setValue(tax);
    }
  }

  calculateTotalPrices(createProduct: any, value?: number) { // Calculamos el valor total aplicando la fórmula
    let subTotal: any = (value ? value : createProduct.controls.product_value.value * createProduct.controls.quantity.value) + createProduct.controls.tax.value;
    if (subTotal) {
      subTotal.toString();
      subTotal = parseFloat(subTotal.toFixed(2));
      createProduct.controls.sub_total.setValue(subTotal);
    }
  }

  changeCalculator(item: string, i: number) {
    this.selectedTax = item; // Cambiamos el tax a través de ícono
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }

  //creamos un producto nuevo que sera pusheado en los formArray
  addProduct(): void {

    if (!this.createProductForm.invalid) {

      this.products = this.createProductForm.get('products') as FormArray;
      this.isLoading = true;

      if (this.form.link.value) {
        this.quotationService.getProductInfo(this.form.link.value.trim())
          .subscribe((res) => {
            if (res) {
              this.form.image.setValue(res.image);
              this.form.name.setValue(res.name);
              this.form.description.setValue(res.description || 'No existe descripción');
              this.form.price.setValue(res.price ? res.price : 0);
              this.products.push(this.createProduct());
              this.getFormula(this.products.controls.length - 1); // LLAMAMOS AL MÉTODO DE LA FORMULA
              this.cleanForm(); // LLAMAMOS AL MÉTODO PARA RESETEAR EL FORMULARIO
              this._notify.show('Tu producto ha sido añadido correctamente.', '', 'success');
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

  cleanForm(): void { //RESET CREATE PRODUCT FORM

    for (const field in this.createProductForm.controls) {
      if (this.isRequired(field)) {
        this.createProductForm.controls[field].reset();
        this.createProductForm.controls[field].setValidators([Validators.required]);
      }
    }
    this.createProductForm.controls.quantity.setValue(1);
  }

  isAllowed(item: string) { return isSwitched(item); }// Método para saber que campos se pueden activar/desactivar los controls de PRODUCTS array

  isRequired(item: string) { return isRequired(item); }// Método para saber que campos se pueden activar/desactivar los controls de PRODUCTS array

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

        this.products.controls[position].get('sub_total').setValue(0); // Volvemos el sub_total en 0

      } else {

        if (this.isAllowed(field)) { // Si es falso simplemente volvemos la propiedad enable() (activo)
          this.products.controls[position].get(field).enable(); // Habilitamos el controlador si freeShipping es verdadero
        }

      }

    }

  }

  getFormula(index?: number) {
    this.isLoadingFormula = true;
    this.calculateTax(this.products.controls[index]); // Calculamos el tax
    this.calculateTotalPrices(this.products.controls[index]); // Calcular el total de precios
    this.quotationService.calculateShipping(this.products.value).subscribe((res) => { // Llamamos al método para calcular los valores de envío

      if (res.length > 0) { // Si el length de la respuesta es mayor a 0 
        this.calculateTotal = res[0]; // Asignamos el valor
        this.calculateTotal.shipping_usd = parseFloat(parseFloat(this.calculateTotal.total + this.calculateTotal.value).toString()).toFixed(2); // Calculamos el costo de envío en USD
        this.calculateTotal.shipping_cop = parseFloat(parseFloat(((this.calculateTotal.total + this.calculateTotal.value) * this.trm.value).toString()).toFixed(0)); // Calculamos el costo de envío en COP multiplicando el valor x el TRM
        this.products.controls[index]['controls'].shipping_value.setValue(res[0].value); // Seteamos el valor del shipping value al backend
      }
      this.isLoadingFormula = false;

    }, err => {
      this.isLoadingFormula = false;
      throw err;
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
