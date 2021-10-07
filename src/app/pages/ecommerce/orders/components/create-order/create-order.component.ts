import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getInsertCreateOrder } from 'src/app/_helpers/tools/create-order-parse.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { OrderService } from '../../../_services/orders.service';
import { numberOnly, isRequired } from '../../../../../_helpers/tools/utils.tool';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})

export class CreateOrderComponent implements OnInit {

  @Output() public refreshTable: EventEmitter<boolean> = new EventEmitter();
  @Output() public close_modale = new EventEmitter<any>();
  @Input() public trm: any;
  @Input() public users: any = [];

  public typeTax: number = 0.07;
  public createProductForm: FormGroup;
  public products: FormArray;
  public isLoading: boolean = false;
  public isLoadingFormula: boolean = false;
  public totalFormulas: any = [];
  public totalValues: any = [];

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
      link: [this.createProductForm.value.link],
      name: [this.createProductForm.value.name],
      aditional_info: [this.createProductForm.value.aditional_info],
      description: [this.createProductForm.value.description],
      image: [this.createProductForm.value.image,],
      quantity: [this.createProductForm.value.quantity],
      product_value: [this.createProductForm.value.price ? this.createProductForm.value.price : 0],
      tax: [0],
      weight: [0],
      discount: [0],
      shipping_origin_value_product: [0],
      permanent_shipping_value: [0],
      free_shipping: [false],
      tax_manually: [false],
      sub_total: [0],
      selected_tax: ["1"],
      initial_weight: [0]
    });

    return createProduct;

  }

  //creamos un producto nuevo que sera pusheado en los formArray
  addProduct(): void {

    if (!this.createProductForm.invalid) {

      this.products = this.createProductForm.get('products') as FormArray;
      this.isLoading = true;

      if (this.form.link.value) {
        this.quotationService.getProductInfo(this.form.link.value.trim())
          .subscribe((res) => {
            this.addItem(res);
            this._notify.show('Tu producto ha sido añadido correctamente.', '', 'success');
            this.isLoading = false;
          }, err => {
            this.addItem(null);
            this._notify.show('Tu producto ha sido añadido correctamente.', '', 'success');
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

  addItem(res: any){
    this.form.image.setValue(res ? res.image : null);
    this.form.name.setValue(res ? res.name : null);
    this.form.description.setValue(res ? res.description : null);
    this.form.price.setValue(res ? res.price : 0);
    this.products.push(this.createProduct());
    this.getFormula(this.products.controls.length - 1); // LLAMAMOS AL MÉTODO DE LA FORMULA
    this.cleanForm(); // LLAMAMOS AL MÉTODO PARA RESETEAR EL FORMULARIO
  }

  cleanForm(): void { //RESET CREATE PRODUCT FORM

    for (const field in this.createProductForm.controls) {
      if (this.isRequired(field)) {
        this.createProductForm.controls[field].reset();
      }
    }
    this.createProductForm.controls.quantity.setValue(1);
  }

  onImageError(event) {
    event.target.src = "assets/images/default.jpg";
  }

  isRequired(item: string) { return isRequired(item); }// Método para saber que campos se pueden activar/desactivar los controls de PRODUCTS array

  numberOnly($event): boolean { return numberOnly($event); } // Función para que sólo se permitan números en un input

  resetProductValue(i: number) {
    this.getFormula(i);
  }

  calculateTaxManually(i: number): void {
    this.products.controls[i]['controls'].tax_manually.setValue(true); // Setear que el tax_muanlly está manual
    this.calculateTotalPrices(i); // Calcular el total de precios
    this.calculateTotalArticles(); // Llamamos la función para obtener los valores totales
  }

  calculateTax(i: number) {
    if (this.products.controls[i]['controls'].free_shipping.value) { // Si el valor del shipping está verdadero
      this.products.controls[i]['controls'].tax.setValue(0); // Seteamos el valor del tax en 0
    } else {
      if (!this.products.controls[i]['controls'].tax_manually.value) { // Validar si el tax se calcula manual o automatico
        var total_tax: number = 0;
        if (this.products.controls[i]['controls'].free_shipping.value === "1" || this.products.controls[i]['controls'].free_shipping.value != null) { // Si elige la primer calculadora
          total_tax = parseFloat((this.products.controls[i]['controls'].product_value.value * this.products.controls[i]['controls'].quantity.value * 0.07).toFixed(2)); // Se obtiene el product_value * la quantity * 7%
          this.products.controls[i]['controls'].tax.setValue(total_tax); // Seteamos en el tax el valor calculado (total_tax)
        } else {
          total_tax = parseFloat((this.products.controls[i]['controls'].product_value.value * this.products.controls[i]['controls'].quantity.value + this.products.controls[i]['controls'].shipping_origin_value_product.value * 0.07).toFixed(2)); // Se obtiene el product_value * la quantity + shipping_origin_value_product * 7%
          this.products.controls[i]['controls'].tax.setValue(total_tax); // Seteamos en el tax el valor calculado (total_tax)
        }
      }
    }
  }

  calculateTotalPrices(i: number) { // Calculamos el valor total aplicando la fórmula
    this.products.controls[i]['controls'].sub_total.setValue(this.products.controls[i]['controls'].product_value.value * this.products.controls[i]['controls'].quantity.value + this.products.controls[i]['controls'].tax.value); // Calculamos el sub_total de un producto (product_value * quantity + tax)
  }

  changeCalculator(item: string, i: number) {
    this.products.controls[i]['controls'].tax_manually.setValue(false);
    this.products.controls[i]['controls'].selected_tax.setValue(item);
    this.getFormula(i); // Obtenemos la fórmula y le pasamos una posición.
  }

  getFormula(i: number) {
    this.isLoadingFormula = true;
    this.quotationService.calculateShipping(this.products.value).subscribe((res: any) => { // Llamamos al método para calcular los valores de envío
      this.totalFormulas = res; // Asignamos el valor que retorna el backend de formulas
      if (res[0].name === 'No aplica') {
        this.products.value.map((product: any, i: number) => {
          this.products.controls[i]['controls'].tax.setValue(0);
          this.calculateTotalPrices(i); // Calcular el total de precios
          this.calculateTotalArticles(); // Calcular el valor de todos los artículos
        });
      } else {
        this.calculateTax(i); // Calculamos el tax
        this.calculateTotalPrices(i); // Calcular el total de precios
        this.calculateTotalArticles(); // Calcular el valor de todos los artículos
      }
      this.isLoadingFormula = false;
    }, err => {
      this.isLoadingFormula = false;
      throw err;
    });
  }

  calculateWeightSubstract(i: number) {
    let product_weight = this.products.controls[i]['controls'].weight.value;//OBTAIN PRODUCT WEIGHT
    let product_quantity = this.products.controls[i]['controls'].quantity.value;//OBTAIN PRODUCT QUANTITY
    this.products.controls[i]['controls'].quantity.setValue(product_quantity - 1); //SUBSTRACT 1 TO QUANTITY
    let unit_weight = (product_weight / product_quantity);// CALC WEIGHT FOR UNIT
    this.products.controls[i]['controls'].weight.setValue(parseFloat((product_weight - unit_weight).toFixed(2)));//SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateWeightAdd(i: number) {
    let product_weight = this.products.controls[i]['controls'].weight.value;//OBTAIN PRODUCT WEIGHT
    let product_quantity = this.products.controls[i]['controls'].quantity.value;//OBTAIN PRODUCT QUANTITY
    this.products.controls[i]['controls'].quantity.setValue(product_quantity + 1);//SUBSTRACT 1 TO QUANTITY
    let unit_weight = (product_weight / product_quantity);// CALC WEIGHT FOR UNIT
    this.products.controls[i]['controls'].weight.setValue(parseFloat((product_weight + unit_weight).toFixed(2)));//SUBSTRACT 1 UNIT TO WEIGHT
  }

  calculateTotalArticles() {
    var sub_total: number = 0;
    var total_weight: number = 0;
    this.products.value.map((product: any) => { sub_total += product.sub_total; total_weight += product.weight; }); // Hacemos la sumatoria del sub_total y weight
    this.totalValues.total_value = sub_total;
    this.totalValues.total_weight = total_weight;
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
          this.createProductForm.getRawValue().products,
          this.totalFormulas,
          this.trm
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
      this._notify.show('Datos incompletos', `Revisa que hayas llenado los campos.`, 'info');
    }

  }

}
