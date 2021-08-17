import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../_services/orders.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {
  @Output() close_modale = new EventEmitter<any>();
  @Input() trm;
  @Input() users = [];
  public createProductForm: FormGroup;
  public products: FormArray;

  public isLoading: boolean = false;

  constructor(private _formBuilder: FormBuilder,
    private quotationService: OrderService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.createProductForm = this._formBuilder.group({
      link: [null, [Validators.required]],
      name: [null],
      description: [null],
      quantity: [1],
      aditional_info: [null, [Validators.required]],
      image: [null],
      products: this._formBuilder.array([]),
      user: [null],
    });
  }

  get form() {
    return this.createProductForm.controls;
  }

  createProduct(): FormGroup {
    return this._formBuilder.group({
      link: [this.createProductForm.value.link, []],
      name: [this.createProductForm.value.name, [Validators.required]],
      aditional_info: [this.createProductForm.value.aditional_info],
      description: [this.createProductForm.value.description, [Validators.required]],
      image: [this.createProductForm.value.image, [Validators.required]],
      quantity: [this.createProductForm.value.quantity, [Validators.required]],
      price: this._formBuilder.group({
        usd: [0],
        cop: [0],
        price_locker: this._formBuilder.group({
          usd: [0],
          cop: [0],
        }),
        tax: [0],
        free_shipping_locker: [false]
      })
    });
  }

  addProduct(): void {
    if (!this.createProductForm.invalid) {
      this.products = this.createProductForm.get('products') as FormArray;
      this.isLoading = true;
      this.quotationService.getProductInfo(this.form.link.value.trim())
        .subscribe((res) => {
          this.isLoading = false;
          console.log("Product info", res)
          if (res) {
            this.form.image.setValue(res.image);
            this.form.name.setValue(res.name);
            this.form.description.setValue(res.description || 'No existe descripción');
            this.products.push(this.createProduct());
            Swal.fire('Tu producto ha sido añadido correctamente', '', 'success');
            // this.showMessage(1, "Tu producto ha sido añadido correctamente");
            this.createProductForm.controls.link.reset();
            this.createProductForm.controls.name.reset();
            this.createProductForm.controls.aditional_info.reset();
            this.createProductForm.controls.image.reset();
            this.createProductForm.controls.description.reset();
            this.createProductForm.controls.quantity.setValue(1);
          } else {
            Swal.fire('Algo ha sucedido y no hemos encontrado la información de tu producto', '', 'warning');
          }
          console.log('products', this.createProductForm)

        }, err => { this.isLoading = false; throw err; })
    } else {
      Swal.fire('Datos del producto incompletos', '', 'warning')
    }
  }


  resetProductValue(i) {
    this.products = this.createProductForm.get('products') as FormArray;
    this.products.controls[i].get('price').get('price_locker').get('usd').setValue(0);
    if (this.products.controls[i].get('price').get('free_shipping_locker').value) {
      this.products.controls[i].get('price').get('price_locker').get('usd').disabled

    } else {
      // this.products.controls[i].get('price').get('price_locker').get('usd')['controls'].enabled();
    }
  }

  calcTotalProducts() {

  }


  createOrder() {
    if (this.createProductForm.valid) {
      this.quotationService.createQuotation({
        user: this.createProductForm.getRawValue().user,
        products: this.createProductForm.getRawValue().products,
      }).subscribe(res => {
        console.log('creamos la orden desde el administrador', res)
      }, err => {
        console.log('tenemos el error')
      })
    } else {
      Swal.fire('Datos incompletos', `- Selecciona el usuario \b -Seleccióna al menos un producto`, 'info')
    }
  }

}
