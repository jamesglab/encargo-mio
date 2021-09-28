import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NotifyService } from 'src/app/_services/notify.service';
import { FragmentService } from '../../services/fragment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

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

  constructor(private _formBuilder: FormBuilder,
    private _notifyService: NotifyService, private _fragmentService: FragmentService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.buildForm();
  }


  // CREAMOS EL FORM ARRAY PARA LOS FRAGMENTOS
  buildForm() {
    this.form = this._formBuilder.group({
      fragments: this._formBuilder.array([this.createFragment()]),
    });
  }


  get fragmentsArray(): FormArray {
    return this.form.get("fragments") as FormArray
  }
  // CREACION DE FORMULARIO PARA PUSHEAR LOS FRAGMENTOS CON SUS CAMPOS
  createFragment(): FormGroup {
    let createFragment = this._formBuilder.group({
      products: [[]],//INICIALIZAMOS EL ARRAY VACIO PARA PODER DRAGUEAR LOS PRODUCTOS
      guide_number: [],
      conveyor: [],
      shipping_value: [],
      weight: [],
      address: []
    });
    return createFragment;
  }



  //CREAMOS LOS FRAGMENTOS Y VALIDAMOS QUE NO SEAN MAYORES AL NUMERO DE PRODUCTOS QUE TIENE EL ENVIO 
  addFragment() {
    let fragments = this.form.get('fragments') as FormArray;
    if (fragments.value.length != this.products_quantity) {
      fragments.push(this.createFragment());
    } else {
      this._notifyService.show('Error', 'No puedes crear más fragmentos', 'warning')
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
  }

  removeFragment(i) {

    if (this.form.get('fragments')['controls'][i].get('products').value.length == 0) {
      this.fragmentsArray.removeAt(i)
    } else {
      this._notifyService.show('Error', 'No puedes eliminar fragmentos con productos', 'warning')
    }
  }
}
