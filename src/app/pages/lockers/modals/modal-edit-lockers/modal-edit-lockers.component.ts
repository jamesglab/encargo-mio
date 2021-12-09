import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { LockersService } from '../../_services/lockers.service';
import { dataURLtoFile, numberOnly } from '../../../../_helpers/tools/utils.tool'
import * as moment from 'moment';
import { updateLocker } from 'src/app/_helpers/tools/create-order-parse.tool';
import { NotifyService } from 'src/app/_services/notify.service';
import { FileHandle } from 'src/app/_directives/file-handle';
import { ImageCompressService } from 'src/app/_services/image-compress.service';

@Component({
  selector: 'app-modal-edit-lockers',
  templateUrl: './modal-edit-lockers.component.html',
  styleUrls: ['./modal-edit-lockers.component.scss']
})

export class ModalEditLockersComponent implements OnInit {

  @Output() public closeModalEditLockers: EventEmitter<boolean> = new EventEmitter();
  @Output() public cancelModalStatus: EventEmitter<boolean> = new EventEmitter();
  @Input() public lockerSelected: any = {};

  public isLoading: boolean = false;
  public isLoadingQuery: boolean = false;
  public lockerEditForm: FormGroup;
  public files: File[] = [];
  public allConveyors: any = [];

  constructor(
    private _lockers: LockersService,
    public _fb: FormBuilder,
    private _orders: OrderService,
    private _notify: NotifyService,
    private _compress: ImageCompressService
  ) { }

  ngOnInit(): void {
    this.getConveyors();
  }

  ngOnChanges() {
    if (this.lockerSelected) {
      this.isLoading = true;
      this._lockers.getLockerDetail(this.lockerSelected.product)
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
      id: [res.id ? res.id : null],
      guide_number: [res.guide_number_alph ? res.guide_number_alph : res.guide_number],
      conveyor: [null],
      locker: [res.locker ? `CA${res.locker.id} | ${res.locker.user.name} ${res.locker.user.last_name}` : '', [Validators.required]],
      locker_info: [res.locker ? res.locker : null],
      order: [res.order_service ? `${res.order_service} | ${res.product.name}` : null],
      name: [res.product ? res.product.name : null],
      weight: [res.weight ? res.weight : 0, [Validators.required]],
      date_recieved: [res.receipt_date ? { day: parseInt(moment(res.receipt_date).format("D")), month: parseInt(moment(res.receipt_date).format("M")), year: parseInt(moment(res.receipt_date).format("YYYY")) } : null],
      permanent_shipping_value: [res.permanent_shipping_value ? res.permanent_shipping_value : 0],
      declared_value_admin: [res.declared_value_admin ? res.declared_value_admin : 0, [Validators.required]],
      product_description: [res.product_description ? res.product_description : null],
      force_commercial_shipping: [res.force_commercial_shipping],
      images: [res.images ? res.images : []],
      product: [res.product ? res.product : null]
      // estimated_delivery_date: [null],
      // national_conveyor: [null],
      // guide_number_national: [null],
    });
    this.pushConveyorSelected(res.conveyor);
    this.lockerEditForm.controls.images.setValue(res.images);
    console.log(this.lockerEditForm.value);
  }

  getConveyors(): void {
    this._orders.getConvenyor().subscribe((res: any) => {
      this.allConveyors = res;
    }, err => {
      throw err;
    });
  }

  pushConveyorSelected(conveyor: number): void {
    let filtered = this.allConveyors.filter(x => x.id == conveyor); // Buscamos el id de todas las transportadoras a través del id guardado en bd
    if (filtered) { // Si existen datos
      this.form.conveyor.setValue(filtered[0]); //Seteamos el valor de conveyor con la respuesta del filtro.
    }
  }

  filesDropped(file: FileHandle[]) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {

      let imageArray: any = [];
      imageArray.push(this.lockerEditForm.controls.images.value);
      this._compress.compressImage(file[0].base64).then((res: any) => {

  

        this.lockerEditForm.controls.images.setValue(res);

      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImage(): void {
    this._compress.uploadImage().then((res) => {
      console.log("RESPONSE DAATA", res);
      this.createFormData(res);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  createFormData(res: any) {
    const formData = new FormData();
    formData.append("image", res.file);
    // formData.append("payload", this.products.controls[position].value.key_aws_bucket);
    this.isLoading = true;
    this._orders.uploadNewImage(formData).subscribe((res: any) => {
      console.log("RESPONSE: ", res);
      // this.products.controls[position]['controls'].image.setValue(res.Location);
      // this.products.controls[position]['controls'].key_aws_bucket.setValue(res.Key);
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      this._notify.show('', 'Ocurrió un error al intentar guardar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  displayWith(option: any) { return option ? option.name : ''; }  // Formato para mostrar simplemente el nombre en el autocomplete

  numberOnly(event): boolean { return numberOnly(event); } // Función para que sólo se permitan números en un input

  onImageError(event) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

  onSelectImage(event: any) { // AGREGAMOS LAS IMAGENES AL ARRAY DE FILES
    this.files.push(...event.addedFiles);
  }

  onRemoveImage(event: any) { // ELIMINAMOS LA IMAGEN
    this.files.splice(this.files.indexOf(event), 1);
  }

  cancelModal(): void {
    this.cancelModalStatus.emit(true);
  }

  onSubmit(): void {

    if (this.lockerEditForm.invalid) {
      this._notify.show('', 'El formulario no se ha completado correctamente.', 'info');
      return;
    }

    this.isLoadingQuery = true;
    var formData = new FormData();
    this.files.forEach((file) => { formData.append('images', file) });  // AGREGAMOS AL CAMPO FILE LAS IMAGENES QUE EXISTAN ESTO CREARA VARIOS ARCHIVOS EN EL FORMDATA PERO EL BACKEND LOS LEE COMO UN ARRAY
    let payload = updateLocker(this.lockerEditForm.getRawValue());
    formData.append("payload", JSON.stringify(payload));

    this._orders.updateProductLocker(formData).subscribe((res: any) => {
      if (res) {
        this._notify.show('', res.message ? res.message : 'Se ha actualizado correctamente.', 'success');
      }
      this.isLoadingQuery = false;
      this.closeModal();
    }, err => {
      this._notify.show('', err.error.message ? err.error.message : 'Ha ocurrido un error.', 'info');
      this.isLoadingQuery = false;
      throw err;
    });

  }

  closeModal(): void {
    this.closeModalEditLockers.emit(false);
  }

}
