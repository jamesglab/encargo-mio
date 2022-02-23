import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from 'src/app/pages/ecommerce/_services/orders.service';
import { LockersService } from '../../_services/lockers.service';
import { numberOnly } from '../../../../_helpers/tools/utils.tool'
import * as moment from 'moment';
import Swal from 'sweetalert2';
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
  public loaderLockers: boolean = false;
  public isSafari: boolean = false;

  public lockerEditForm: FormGroup;

  public allConveyors: any = [];
  public allLockers: any[] = [];

  constructor(
    private _lockers: LockersService,
    public _fb: FormBuilder,
    private _orders: OrderService,
    private _notify: NotifyService,
    private _compress: ImageCompressService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getConveyors();
    this.checkIfSafari();
  }

  checkIfSafari(): void {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        this.isSafari = false;
      } else {
        this.isSafari = true;
      }
    }
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
      id: [res.id || null],
      guide_number: [res.guide_number_alph ? res.guide_number_alph : res.guide_number],
      conveyor: [null],
      locker_info: [{ locker_id: res.locker.id, us_id: res.locker.user.id, us_name: res.locker.user.name, us_last_name: res.locker.user.last_name }],
      order: [res.order_service ? `${res.order_service} | ${res.product.name}` : null],
      name: [res.product.name || null],
      weight: [res.weight || 0, [Validators.required]],
      date_recieved: [res.receipt_date ? { day: parseInt(moment(res.receipt_date).format("D")), month: parseInt(moment(res.receipt_date).format("M")), year: parseInt(moment(res.receipt_date).format("YYYY")) } : null],
      permanent_shipping_value: [res.permanent_shipping_value || 0],
      declared_value_admin: [res.declared_value_admin || 0, [Validators.required]],
      product_description: [res.product_description || null],
      force_commercial_shipping: [res.force_commercial_shipping],
      images: [res.images || []],
      deleted_images: [[]],
      product: [res.product || null]
    });
    this.pushConveyorSelected(res.conveyor);
    this.pushImages();
  }

  getConveyors(): void {
    this._orders.getConvenyor().subscribe((res: any) => {
      this.allConveyors = res;
    }, err => {
      throw err;
    });
  }

  autoCompleteLocker(params: any) {
    if (params.length >= 2) {
      this.loaderLockers = true;
      this._orders.getUsersByName(params)
        .subscribe((res: any) => {
          this.allLockers = res;
          this.loaderLockers = false;
          this.cdr.detectChanges();
        }, err => {
          this.loaderLockers = false;
          throw err;
        });
    }
  }

  setDisplayLocker(locker_object: { [key: string]: any }): string {
    return `CA${locker_object.locker_id} | ${locker_object.us_name} ${locker_object.us_last_name}`;
  }

  pushConveyorSelected(conveyor: number): void {
    let filtered = this.allConveyors.filter(x => x.id == conveyor); // Buscamos el id de todas las transportadoras a través del id guardado en bd
    if (filtered) { // Si existen datos
      this.form.conveyor.setValue(filtered[0]); //Seteamos el valor de conveyor con la respuesta del filtro.
    }
  }

  pushImages(): void {
    let backendImages: any = [];
    for (let index = 0; index < this.lockerEditForm.controls.images.value.length; index++) {
      backendImages.push(this.lockerEditForm.controls.images.value[index]);
    }
    this.lockerEditForm.controls.images.setValue(backendImages);
  }

  filesDropped(file: FileHandle[]) { // Método el cual entra cuando un usuario hace el "drop"
    if (file[0].file.type && file[0].file.type.includes('image')) {
      this._compress.compressImage(file[0].base64).then((res: any) => {
        this.createFormData(res);
      }, err => {
        this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
        throw err;
      });
    } else {
      this._notify.show('', 'El archivo que seleccionaste no es una imagen.', 'info');
    }
  }

  uploadImage(): void {
    this._compress.uploadImage().then((res: any) => {
      this.createFormData(res);
    }, err => {
      this._notify.show('', 'Ocurrió un error al intentar cargar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  createFormData(res: any) {
    const formData = new FormData();
    formData.append("images", res.file);
    this.isLoadingQuery = true;
    this._lockers.uploadImageNewLocker(formData).subscribe((res: any) => {
      let images: any[] = this.lockerEditForm.controls.images.value;
      for (let index = 0; index < res.images.length; index++) {
        images.push(res.images[index]);
      }
      this.lockerEditForm.controls.images.setValue(images);
      this.isLoadingQuery = false;
    }, err => {
      this.isLoadingQuery = false;
      this._notify.show('', 'Ocurrió un error al intentar guardar la imagen, intenta de nuevo.', 'error');
      throw err;
    });
  }

  displayWith(option: any) { return option ? option.name : ''; }  // Formato para mostrar simplemente el nombre en el autocomplete

  numberOnly(event): boolean { return numberOnly(event, this.isSafari); } // Función para que sólo se permitan números en un input

  onImageError(event) { event.target.src = "https://i.imgur.com/riKFnErh.jpg"; }

  onRemoveImage(position: number) {
    Swal.fire({
      text: "¿Estás seguro de borrar la imagen?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, quiero borrarla',
      cancelButtonText: ' Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let temporalyDeletedImg: any = this.lockerEditForm.controls.deleted_images.value;
        temporalyDeletedImg.push(this.lockerEditForm.controls.images.value[position]);
        this.lockerEditForm.controls.deleted_images.setValue(temporalyDeletedImg);
        this.lockerEditForm.controls.images.value.splice(position, 1);
        let allImages: any[] = this.lockerEditForm.controls.images.value;
        this.lockerEditForm.controls.images.setValue(allImages);
      }
    });
  }

  cancelModal(): void { this.cancelModalStatus.emit(true); }

  onSubmit(): void {

    if (this.lockerEditForm.invalid) {
      this._notify.show('', 'El formulario no se ha completado correctamente.', 'info');
      return;
    }

    this.isLoadingQuery = true;
    var formData = new FormData();
    this.lockerEditForm.controls.images.value.map((image: any) => { formData.append('images', image) });

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