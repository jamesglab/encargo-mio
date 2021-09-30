import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifyService } from 'src/app/_services/notify.service';
import { FragmentService } from '../../services/fragment.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fragment-products',
  templateUrl: './fragment-products.component.html',
  styleUrls: ['./fragment-products.component.scss']
})
export class FragmentProductsComponent implements OnInit {

  @Input() products = [];// ARRAY DE PRODUCTOS 
  @Input() public conveyors: any = [];
  @Input() public addresses: any = [];
  @Input() public shipping: any;
  @Input() public products_quantity: number; //CONTADOR DE PRODUCTOs

  public form: FormGroup;// CREAMOS EL FORMULARIO
  public submit: boolean = false;
  public isLoading: boolean = false;

  private unsuscribe: Subscription[] = [];

  constructor(private fb: FormBuilder,
    private _notifyService: NotifyService, private fragmentService: FragmentService, private router: Router) { }

  ngOnInit(): void {
    this.buildForm();
  }

  // CREAMOS EL FORM ARRAY PARA LOS FRAGMENTOS
  buildForm() {
    this.form = this.fb.group({
      fragments: this.fb.array([]),
    });
  }

  get fragmentsArray(): FormArray {
    return this.form.get("fragments") as FormArray
  }

  obtainForm(i) {
    return this.form.get('fragments')['controls'][i];
  }

  // CREACION DE FORMULARIO PARA PUSHEAR LOS FRAGMENTOS CON SUS CAMPOS
  createFragment(): FormGroup {
    let createFragment = this.fb.group({
      products: [[]],//INICIALIZAMOS EL ARRAY VACIO PARA PODER DRAGUEAR LOS PRODUCTOS
      guide_number: [],
      conveyor: [],
      shipping_value: [0, [Validators.required, Validators.min(0.1)]],
      weight: [0, [Validators.required, Validators.min(0.1)]],
      address: [null, [Validators.required]]
    });
    return createFragment;
  }

  //CREAMOS LOS FRAGMENTOS Y VALIDAMOS QUE NO SEAN MAYORES AL NUMERO DE PRODUCTOS QUE TIENE EL ENVIO 
  addFragment() {
    let fragments = this.fragmentsArray;
    if (fragments.value.length != this.products_quantity) {
      fragments.push(this.createFragment());//CREATE FRAGMENT
      this.setShippingValue();//CALCULATE SHIPPING VALUE
    } else {
      this._notifyService.show('Error', `Has alcanzado la cantidad máxima de fragmentos permitidos 
      (${this.products.length})`, 'warning')
    }
  }

  // DROP DE PRODUCTOS ENTRE LOS DIFERENTES SELECTORES
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.setWeightAfterDrop();//VALIDATE ALL WEIGHT ACCORD WEIGHT OF PRODUCTS DROPPED
    this.setShippingValue();//VALIDATE SHIPPING VALUE OF FRAGMENT AGAIN
  }


  removeFragment(i) {

    if (this.form.get('fragments')['controls'][i].get('products').value.length == 0) {
      this.fragmentsArray.removeAt(i)
    } else {
      this._notifyService.show('Alto', 'No es posible eliminar un fragmento que contiene productos.', 'warning')
    }
  }

  setWeightAfterDrop() { // ITERATE ARRAY
    const fragments = this.fragmentsArray;
    fragments.value.map((fragment, i) => {
      var totalWeight = 0; //VALIDATE ALL WEIGHT OF PRODUCTS BY FRAGMENT fragment: { products:[...] }
      fragment.products.map((product) => {
        totalWeight += product.weight;
      })
      this.fragmentsArray.controls[i].get('weight').setValue(totalWeight);
    })
  }

  totalWeight() {
    const fragments = this.fragmentsArray;
    var totalWeight = 0;
    fragments.value.map((fragment) => { //OBTAIN TOTAL WEIGHT OF FRAGMENTS fragment: { weight: ... }
      totalWeight += fragment.weight;
    });
    return totalWeight;
  }

  setShippingValue() {
    let totalWeight = this.totalWeight();

    for (let i = 0; i < this.fragmentsArray.controls.length; i++) {//ITERATE ALL FRAGMENTS
      let fragment = this.fragmentsArray.controls[i]; //OBTAIN CURRENT FRAGMENT
      let currentWeight = fragment.get('weight').value; //OBTAIN CURRENT WEIGHT

      if (!currentWeight || currentWeight === 0) { //IF DOESN´T EXISTS WEIGHT
        // MAKE A SUBSTRACT OF WEIGHT (PARENTWEIGHT - TOTALWEIGHT OF FRAGMENTS) 
        let substract = this.shipping.total_weight - totalWeight; 
        
        if (substract < 0) {//VALIDATE NEGATIVE WEIGHTS
          fragment.get('weight').setValue((0));
        } else {
          fragment.get('weight').setValue((substract))
        }

      }

      totalWeight = this.totalWeight(); //CALCULATE AGAIN THE WEIGHT BECASUSE WAS SET IN SUBSTRACT ^
      currentWeight = fragment.get('weight').value; //OBTAIN AGAINT CURRENT WEIGHT BECAUSE WAS SET IN SUBSTRACT ^

      let final_price = ((currentWeight * this.shipping.total_value) / (totalWeight)); //CALC FINAL PRICE ACCORD FORMULE
      fragment.get('shipping_value').setValue(final_price.toFixed(2)); //SET FRAGMENT FINAL VALUE
    }

  }

  onSubmit() {

    this.submit = true;
    this.isLoading = true;
    if (this.form.invalid) { //VALIDATE IF FORM IS INVALID
      this.isLoading = false;
      return;
    }

    let foundEmpty = 0;
    for (let i = 0; i < this.fragmentsArray.controls.length; i++) { //ITERATE FRAGMENT FOR FIND AN ARRAY OF PRODUCTS EMPTY 
      let fragment = this.fragmentsArray.controls[i];
      if (fragment.get('products').value.length === 0) {
        foundEmpty = i + 1;//SAVE THE POSITION OF FRAGMENT WHIT PRODUCTS EMPTY ARRAY
      }
    }

    if (foundEmpty > 0) {//IF A PRODUCTS EMPTY WAS FOUND, SHOW ALERT
      this.isLoading = false;
      this._notifyService.show('Error', `El fragmento #${foundEmpty} NO contiene productos`, 'warning');
      return;
    }

    const { fragments } = this.form.getRawValue(); //DESCTRUCTING FRAGMENTS, AND SEND REQUEST
    const insertFragmentsSubscr = this.fragmentService.insert({ fragments, shipping: this.shipping })
    .subscribe((res) => {
      this._notifyService.show('!hecho¡', 'El envío ha sido fragmentado con exito.', 'success');
      this.router.navigate(['/ecommerce/orders-shippings'])
    }, err => {
      throw err;
    })
    this.unsuscribe.push(insertFragmentsSubscr);
  }

  ngOnDestroy(){
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
