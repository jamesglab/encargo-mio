import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dataURLtoFile } from 'src/app/_helpers/tools/utils.tool';
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

  @Input() public products: any = [];// ARRAY DE PRODUCTOS 
  @Input() public conveyors: any = [];
  @Input() public addresses: any = [];
  @Input() public shipping: any;
  @Input() public products_quantity: number; //CONTADOR DE PRODUCTOs

  public fragmentsForm: FormGroup;// CREAMOS EL FORMULARIO

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
    this.fragmentsForm = this.fb.group({
      fragments: this.fb.array([]),
    });
  }

  get fragmentsArray(): FormArray {
    return this.fragmentsForm.get("fragments") as FormArray
  }

  obtainForm(i) {
    return this.fragmentsForm.get('fragments')['controls'][i];
  }

  getProductsOfFragment(index: number): any {
    return this.fragmentsForm.get('fragments')['controls'][index].get('products').value;
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
    if (this.shipping && this.shipping.length <= 1) {
      this._notifyService.show('Error', `No puedes fraccionar ${this.shipping.length} producto.`, 'warning');
      return;
    }

    let fragments = this.fragmentsArray;
    if (fragments.value.length != this.products_quantity) {
      fragments.push(this.createFragment());//CREATE FRAGMENT
      this.setShippingValue();//CALCULATE SHIPPING VALUE
    } else {
      this._notifyService.show('Error', `Has alcanzado la cantidad máxima de fragmentos permitidos (${this.products.length})`, 'warning');
    }

  }

  setImages(product) { //FOR SET IMAGES THAT ARE IN DB

    product.files = [];
    product.isLoadingImages = true;
    Promise.all(
      product.images.map(async (image) => {//ITERATE PRODUCT IMAGES
        await new Promise((resolve, reject) => { //NEW PROMISE

          this.fragmentService.getImage(image).subscribe(async (blob) => {//HTTP OBSERVABLE
            const dataUrl = await new Promise((resolve, reject) => {// NEW PROMISE TO READER FILE
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })

            product.files.push(dataURLtoFile(dataUrl, "imagen.jpg")); // PUSH IMAGES INTO PRODUCT.FILES ARRAY
            resolve("ok")

          }, err => { product.isLoadingImages = false; reject(err); throw err; });

        })
      })
    ).then(() => product.isLoadingImages = false) // END LOADING

  }

  addImage($event: any, fragmentIndex: number, productIndex: number) { //ADD IMAGE TO ONE PRODUCT OF FRAGMENT
    const products = this.getProductsOfFragment(fragmentIndex); //GET PRODUCTS
    products[productIndex].files.unshift(...$event.addedFiles); // ADD NEW IMAGE
    this.setImagesProductFragment(products[productIndex]);
  }

  removeImage(file, fragmentIndex: number, productIndex: number) {// DELETE IMAFE FROM ONE PRODUCT OF FRAGMENT
    const products = this.getProductsOfFragment(fragmentIndex); //GET PRODUCTS
    products[productIndex].files
      .splice(products[productIndex].files.indexOf(file), 1); //DELETE IMAGE
    this.setImagesProductFragment(products[productIndex]);
  }

  setImagesProductFragment(product: { [key: string]: any }): void {
    product.isLoadingImages = true;

    var formData = new FormData();
    //ITERATE PRODUCT AND ADD TO "FILES" FIELD OF FORMDATA
    product.files.forEach((file) => { formData.append('files', file) });
    const { images } = product;//DESTRUCT IMAGES
    formData.append("payload", JSON.stringify({ images, product })); // ADD PRODUCT AND IMAGE

    this.fragmentService.setImageProductFragment(formData)
      .subscribe((res) => {
        product.images = res.new_images; //SET NEW ARRAY OF IMAGES [{Location, Key}]
        product.isLoadingImages = false;
      }, err => { product.isLoadingImages = false; throw err; });
  }

  // DROP DE PRODUCTOS ENTRE LOS DIFERENTES SELECTORES
  async drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
        this.setImages(event.container.data[event.currentIndex]);
    }

    this.setWeightAfterDrop();//VALIDATE ALL WEIGHT ACCORD WEIGHT OF PRODUCTS DROPPED
    this.setShippingValue();//VALIDATE SHIPPING VALUE OF FRAGMENT AGAIN
  }

  removeFragment(i) {
    if (this.fragmentsForm.get('fragments')['controls'][i].get('products').value.length == 0) {
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
      });
      this.fragmentsArray.controls[i].get('weight').setValue(totalWeight);
    });
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
    if (this.fragmentsForm.invalid) { //VALIDATE IF FORM IS INVALID
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

    const { fragments } = this.fragmentsForm.getRawValue(); //DESCTRUCTING FRAGMENTS, AND SEND REQUEST
    const insertFragmentsSubscr = this.fragmentService.insert({ fragments, shipping: this.shipping })
      .subscribe((res) => {
        this._notifyService.show('¡Hecho!', 'El envío ha sido fragmentado con exito.', 'success');
        this.router.navigate(['/ecommerce/orders-shippings'])
      }, err => {
        throw err;
      })
    this.unsuscribe.push(insertFragmentsSubscr);
  }

  errorImage(event: any): void {
    event.target.src = 'assets/images/default.jpg';
  }

  ngOnDestroy() {
    this.unsuscribe.forEach((sb) => sb.unsubscribe());
  }

}
