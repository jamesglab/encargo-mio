import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NotifyService } from 'src/app/_services/notify.service';

@Component({
  selector: 'app-fragment-products',
  templateUrl: './fragment-products.component.html',
  styleUrls: ['./fragment-products.component.scss']
})
export class FragmentProductsComponent implements OnInit {
  // ARRAY DE PRODUCTOS DUMMY
  products = [
    {
      image: 'assets/images/default.jpg',
      name: 'mi producto',
      weight: 10
    },
    {
      image: 'assets/images/default.jpg',
      name: 'mi producto',
      weight: 10
    }, {
      image: 'assets/images/default.jpg',
      name: 'mi producto',
      weight: 10
    }, {
      image: 'assets/images/default.jpg',
      name: 'mi producto',
      weight: 10
    }, {
      image: 'assets/images/default.jpg',
      name: 'mi producto',
      weight: 10
    }
  ];
  // CREAMOS EL FORMULARIO
  public form: FormGroup;
  conveyors: any = [] //PENDIENTE POR CONSUMIR EL ENDPOINT DE LAS TRANSPORTADORAS
  constructor(private _formBuilder: FormBuilder,
    private _notifyService: NotifyService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  // CREAMOS EL FORM ARRAY PARA LOS FRAGMENTOS
  buildForm() {
    this.form = this._formBuilder.group({
      fragments: this._formBuilder.array([this.createFragment()]),
    });
  }

  // CREACION DE FORMULARIO PARA PUSHEAR LOS FRAGMENTOS CON SUS CAMPOS

  createFragment(): FormGroup {

    let createFragment = this._formBuilder.group({
      products: [[]],//INICIALIZAMOS EL ARRAY VACIO PARA PODER DRAGUEAR LOS PRODUCTOS
      guide_number: [],
      conveyor: [],
      shipping_value: [],
      weight: [],
      direction: []
    });
    return createFragment;
  }



  //CREAMOS LOS FRAGMENTOS Y VALIDAMOS QUE NO SEAN MAYORES AL NUMERO DE PRODUCTOS QUE TIENE EL ENVIO 
  addFragment() {
    let fragments = this.form.get('fragments') as FormArray;
    console.log('fragments', fragments)
    if (fragments.value.length != this.products.length) {
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
}
