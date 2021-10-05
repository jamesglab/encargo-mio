import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { LockersService } from '../../_services/lockers.service';
import { dataURLtoFile, numberOnly } from '../../../../_helpers/tools/utils.tool'
import * as moment from 'moment';

@Component({
  selector: 'app-modal-edit-lockers',
  templateUrl: './modal-edit-lockers.component.html',
  styleUrls: ['./modal-edit-lockers.component.scss']
})

export class ModalEditLockersComponent implements OnInit {

  @Output() public closeModalEditLockers: EventEmitter<boolean> = new EventEmitter();
  @Input() public lockerSelected: any = {};

  public isLoading: boolean = false;
  public isLoadingQuery: boolean = false;
  public lockerEditForm: FormGroup;
  public files: File[] = [];
  public allConveyors: any = [];

  constructor(
    private _lockers: LockersService,
    public _fb: FormBuilder,
    private _orders: OrderService
  ) { }

  ngOnInit(): void {
    this.getConveyors();
  }

  ngOnChanges() {
    if (this.lockerSelected) {
      this.isLoading = true;
      this._lockers.getLockerDetail(this.lockerSelected.product.id)
        .subscribe((res: any) => {
          this.buildForm(res);
          this.isLoading = false;
        }, err => {
          this.isLoading = false;
          throw err;
        });
    }
  }

  get form() {
    return this.lockerEditForm.controls;
  }

  buildForm(res: any): void {
    this.lockerEditForm = this._fb.group({
      guide_number: [res.guide_number ? res.guide_number : null],
      conveyor: [null], // Ojo a esto
      locker: [res.locker ? `CA${res.locker.id} | ${res.locker.user.name} ${res.locker.user.last_name}` : '', [Validators.required]],
      locker_info: [res.locker ? res.locker : null],
      order: [res.order_purchase ? `${res.order_purchase.id} | ${res.product.name}` : null],
      order_info: [res.order_purchase ? res.order_purchase : null],
      name: [res.product ? res.product.name : null],
      weight: [res.weight ? res.weight : 0, [Validators.required]],
      date_recieved: [res.receipt_date ? { day: parseInt(moment(res.receipt_date).format("D")), month: parseInt(moment(res.receipt_date).format("M")), year: parseInt(moment(res.receipt_date).format("YYYY")) } : null],
      shipping_value: [res.shipping_value ? res.shipping_value : 0],
      declared_value_admin: [res.declared_value_admin ? res.declared_value_admin : 0, [Validators.required]],
      product_description: [res.product_description ? res.product_description : null],
      force_commercial_shipping: [false],
      estimated_delivery_date: [null],
      // national_conveyor: [null],
      // guide_number_national: [null],
    });
    // if (res.image) {
    //   res.images.splice(0, 0, { Location: res.image });
    // }
    this.pushConveyorSelected(res.conveyor);
    this.pushImagesResponse(res.images);
  }

  pushConveyorSelected(conveyor: number): void {
    let filtered = this.allConveyors.filter(x => x.id == conveyor); // Buscamos el id de todas las transportadoras a través del id guardado en bd
    if (filtered) { // Si existen datos
      this.form.conveyor.setValue(filtered[0]); //Seteamos el valor de conveyor con la respuesta del filtro.
    }
  }

  pushImagesResponse(images: any): void { // Pusheamos las imagenes que están guardadas en la base de datos.
    for (let index = 0; index < images.length; index++) {
      const toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
      toDataURL(images[index].Location)
        .then(dataUrl => {
          var fileData = dataURLtoFile(dataUrl, "imagen.jpg");
          this.files.push(fileData);
        });
    }
  }

  displayWith(option: any) { // Formato para mostrar simplemente el nombre en el autocomplete
    return option ? option.name : '';
  }

  numberOnly(event): boolean { return numberOnly(event); } // Función para que sólo se permitan números en un input

  onSelectImage(event: any) { // AGREGAMOS LAS IMAGENES AL ARRAY DE FILES
    this.files.push(...event.addedFiles);
  }

  onRemoveImage(event: any) { // ELIMINAMOS LA IMAGEN
    this.files.splice(this.files.indexOf(event), 1);
  }

  getConveyors(): void {
    this._orders.getConvenyor().subscribe((res: any) => {
      this.allConveyors = res;
    }, err => {
      throw err;
    });
  }

  closeModal(): void {
    this.closeModalEditLockers.emit(false);
  }

  onSubmit(): void {
    if (this.lockerEditForm.invalid) {
      console.log("EL FORMULARIO ES INVÁLIDO");
      return;
    }
    this.isLoadingQuery = true;
    console.log("READY TO RACE", this.lockerEditForm.getRawValue());
    this.isLoadingQuery = false;

  }

}
